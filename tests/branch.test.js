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
  const input = await driver.findElement(By.css(`[name="${name}"]`));

  await input.clear();

  if (value !== "") {
    await input.sendKeys(value);
  }
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
  await clickButton("เพิ่มสาขา");

  await driver.wait(until.elementLocated(By.css('input[name="code"]')), 5000);
}

async function closeForm() {
  await clickButton("ยกเลิก");
}

async function fillBranch(data) {
  await setField("code", data.code);
  await setField("name", data.name);
  await setField("address", data.address);
  await setField("phone", data.phone);
}

const validBranch = {
  code: "SELTEST001",
  name: "สาขาทดสอบ Selenium",
  address: "นครปฐม",
  phone: "034123456",
};

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
    until.elementLocated(By.xpath("//*[normalize-space(text())='สาขา']")),
    10000,
  );

  await menu.click();

  await driver.wait(
    until.elementLocated(By.xpath("//button[contains(.,'เพิ่มสาขา')]")),
    10000,
  );

  await test("BR-01 ไม่กรอกข้อมูลสาขา", async () => {
    await openForm();
    await clickButton("บันทึก");

    await checkAlert("กรุณากรอกข้อมูลให้ครบ");
    await closeForm();
  });

  await test("BR-02 ไม่กรอกรหัสสาขา", async () => {
    await openForm();

    await fillBranch({
      ...validBranch,
      code: "",
    });

    await clickButton("บันทึก");
    await checkAlert("กรุณากรอกข้อมูลให้ครบ");
    await closeForm();
  });

  await test("BR-03 ไม่กรอกชื่อสาขา", async () => {
    await openForm();

    await fillBranch({
      ...validBranch,
      name: "",
    });

    await clickButton("บันทึก");
    await checkAlert("กรุณากรอกข้อมูลให้ครบ");
    await closeForm();
  });

  await test("BR-04 ไม่กรอกที่อยู่สาขา", async () => {
    await openForm();

    await fillBranch({
      ...validBranch,
      address: "",
    });

    await clickButton("บันทึก");
    await checkAlert("กรุณากรอกข้อมูลให้ครบ");
    await closeForm();
  });

  await test("BR-05 ไม่กรอกเบอร์โทรสาขา", async () => {
    await openForm();

    await fillBranch({
      ...validBranch,
      phone: "",
    });

    await clickButton("บันทึก");
    await checkAlert("กรุณากรอกข้อมูลให้ครบ");
    await closeForm();
  });
} catch (error) {
  console.log("SETUP FAIL:", error.message);
  failed++;
} finally {
  await driver.quit();
}

console.log("\n===== BRANCH TEST =====");
console.log("PASS:", passed);
console.log("FAIL:", failed);
console.log("TOTAL:", passed + failed);

if (failed > 0) {
  process.exitCode = 1;
}
