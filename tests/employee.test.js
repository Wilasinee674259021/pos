import { Builder, By, until } from "selenium-webdriver";

const driver = await new Builder().forBrowser("chrome").build();

let passed = 0;
let failed = 0;

async function test(name, action) {
  try {
    await action();
    console.log("PASS:", name);
    passed++;
  } catch (error) {
    console.log("FAIL:", name);
    console.log("สาเหตุ:", error.message);
    failed++;

    try {
      const alert = await driver.switchTo().alert();
      await alert.dismiss();
    } catch {}
  }
}

async function clickButton(text) {
  const button = await driver.wait(
    until.elementLocated(
      By.xpath(`//button[contains(normalize-space(.),'${text}')]`),
    ),
    10000,
  );

  await button.click();
}

async function setField(name, value) {
  const input = await driver.findElement(By.css(`input[name="${name}"]`));

  await input.clear();
  await input.sendKeys(String(value));
}

async function checkAlert(expected) {
  const alert = await driver.wait(until.alertIsPresent(), 5000);

  const actual = await alert.getText();
  await alert.accept();

  if (actual !== expected) {
    throw new Error(`Expected: ${expected} | Actual: ${actual}`);
  }
}

async function openForm() {
  await clickButton("เพิ่มพนักงาน");

  await driver.wait(
    until.elementLocated(By.css('input[name="employeeCode"]')),
    5000,
  );
}

async function closeForm() {
  await clickButton("ยกเลิก");
}

async function fillEmployee(code, username) {
  await setField("employeeCode", code);
  await setField("name", "พนักงานทดสอบ Selenium");
  await setField("username", username);
  await setField("password", "1234");
}

async function getEmployees() {
  return await driver.executeScript(`
    const data = JSON.parse(
      localStorage.getItem("pos_employees") || "[]"
    );

    return Array.isArray(data) ? data : [];
  `);
}

try {
  await driver.get("http://localhost:5173/");

  const loginInputs = await driver.findElements(
    By.css('input[autocomplete="username"]'),
  );

  if (loginInputs.length > 0) {
    await loginInputs[0].sendKeys("admin");

    await driver
      .findElement(By.css('input[autocomplete="current-password"]'))
      .sendKeys("1234");

    await driver.findElement(By.css('button[type="submit"]')).click();
  }

  const menu = await driver.wait(
    until.elementLocated(By.xpath("//*[normalize-space(text())='พนักงาน']")),
    10000,
  );

  await menu.click();

  await driver.wait(
    until.elementLocated(By.xpath("//button[contains(.,'เพิ่มพนักงาน')]")),
    10000,
  );

  const employees = await getEmployees();

  console.log("\nพบพนักงานเดิม:", employees.length, "คน");

  const existingUsername = employees.find((emp) => emp.username)?.username;

  if (!existingUsername) {
    throw new Error("ไม่พบ Username สำหรับทดสอบข้อมูลซ้ำ");
  }

  await test("EMP-01 ไม่กรอกข้อมูลพนักงาน", async () => {
    await openForm();
    await clickButton("บันทึก");

    await checkAlert("กรุณากรอกข้อมูลให้ครบ");

    await closeForm();
  });

  await test("EMP-02 Username ซ้ำ", async () => {
    await openForm();

    await fillEmployee("SELTEST001", existingUsername);

    await clickButton("บันทึก");

    await checkAlert("Username นี้มีอยู่แล้ว");

    await closeForm();
  });

  await test("EMP-03 รหัสพนักงานซ้ำ", async () => {
    // สำรองข้อมูลเดิม
    const original = await driver.executeScript(
      `return localStorage.getItem("pos_employees");`,
    );

    try {
      const testEmployees = [
        ...employees,
        {
          id: 999999,
          employeeCode: "SEL-DUP-001",
          name: "Selenium Duplicate Test",
          username: "selenium_existing_test",
          password: "1234",
          position: "พนักงานขาย",
          branch: "สาขาหลัก",
          role: "พนักงาน",
          status: "เปิดใช้งาน",
        },
      ];

      await driver.executeScript(
        `localStorage.setItem(
            "pos_employees",
            JSON.stringify(arguments[0])
          );`,
        testEmployees,
      );

      await driver.navigate().refresh();

      const employeeMenu = await driver.wait(
        until.elementLocated(
          By.xpath("//*[normalize-space(text())='พนักงาน']"),
        ),
        10000,
      );

      await employeeMenu.click();

      await openForm();

      await fillEmployee("SEL-DUP-001", "selenium_new_unique_test");

      await clickButton("บันทึก");

      await checkAlert("รหัสพนักงานนี้มีอยู่แล้ว");

      await closeForm();
    } finally {
      await driver.executeScript(
        `
          if (arguments[0] === null) {
            localStorage.removeItem("pos_employees");
          } else {
            localStorage.setItem(
              "pos_employees",
              arguments[0]
            );
          }
          `,
        original,
      );
    }
  });
} catch (error) {
  console.log("SETUP FAIL:", error.message);
  failed++;
} finally {
  await driver.quit();
}

console.log("\n===== EMPLOYEE TEST =====");
console.log("PASS:", passed);
console.log("FAIL:", failed);
console.log("TOTAL:", passed + failed);

if (failed > 0) {
  process.exitCode = 1;
}
