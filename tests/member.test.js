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
    console.log(error.message);
    failed++;

    try {
      const alert = await driver.switchTo().alert();
      await alert.dismiss();
    } catch {}
  }
}

async function checkAlert(expected) {
  const alert = await driver.wait(until.alertIsPresent(), 5000);

  const actual = await alert.getText();
  await alert.accept();

  if (actual !== expected) {
    throw new Error(`Expected: ${expected}, Actual: ${actual}`);
  }
}

async function openForm() {
  const cancelButtons = await driver.findElements(
    By.xpath("//button[normalize-space()='ยกเลิก']"),
  );

  if (cancelButtons.length > 0) {
    await cancelButtons[0].click();
  }

  await driver
    .findElement(By.xpath("//button[contains(.,'สมัครสมาชิก')]"))
    .click();

  await driver.wait(
    until.elementLocated(By.css('input[placeholder="เช่น สมชาย ใจดี"]')),
    5000,
  );
}

async function fillForm(name, phone) {
  const nameInput = await driver.findElement(
    By.css('input[placeholder="เช่น สมชาย ใจดี"]'),
  );

  const phoneInput = await driver.findElement(
    By.css('input[placeholder="เช่น 0812345678"]'),
  );

  await nameInput.sendKeys(name);
  await phoneInput.sendKeys(phone);
}

async function saveForm() {
  await driver.findElement(By.xpath("//button[contains(.,'บันทึก')]")).click();
}

async function closeForm() {
  await driver
    .findElement(By.xpath("//button[normalize-space()='ยกเลิก']"))
    .click();
}

try {
  await driver.get("http://localhost:5173/");

  await driver
    .findElement(By.css('input[autocomplete="username"]'))
    .sendKeys("admin");

  await driver
    .findElement(By.css('input[autocomplete="current-password"]'))
    .sendKeys("1234");

  await driver.findElement(By.css('button[type="submit"]')).click();

  const memberMenu = await driver.wait(
    until.elementLocated(By.xpath("//*[normalize-space(text())='สมาชิก']")),
    10000,
  );

  await memberMenu.click();

  await driver.wait(
    until.elementLocated(By.xpath("//button[contains(.,'สมัครสมาชิก')]")),
    10000,
  );

  await test("TC-038 ไม่กรอกชื่อสมาชิก", async () => {
    await openForm();
    await fillForm("", "0812345678");
    await saveForm();
    await checkAlert("กรุณากรอกชื่อ-นามสกุล");
    await closeForm();
  });

  await test("TC-039 ไม่กรอกเบอร์โทรศัพท์", async () => {
    await openForm();
    await fillForm("สมาชิกทดสอบ", "");
    await saveForm();
    await checkAlert("กรุณากรอกเบอร์โทรศัพท์ 10 หลัก");
    await closeForm();
  });

  await test("TC-040 เบอร์โทร 9 หลัก", async () => {
    await openForm();
    await fillForm("สมาชิกทดสอบ", "081234567");
    await saveForm();
    await checkAlert("กรุณากรอกเบอร์โทรศัพท์ 10 หลัก");
    await closeForm();
  });

  await test("TC-041 เบอร์โทร 11 หลัก", async () => {
    await openForm();
    await fillForm("สมาชิกทดสอบ", "08123456789");

    const phone = await driver.findElement(
      By.css('input[placeholder="เช่น 0812345678"]'),
    );

    const value = await phone.getAttribute("value");

    if (value.length !== 10) {
      throw new Error(`เบอร์มี ${value.length} หลัก`);
    }

    await closeForm();
  });

  await test("TC-042 เบอร์มีตัวอักษร", async () => {
    await openForm();
    await fillForm("สมาชิกทดสอบ", "08123abcde");

    const phone = await driver.findElement(
      By.css('input[placeholder="เช่น 0812345678"]'),
    );

    const value = await phone.getAttribute("value");

    if (/[a-zA-Z]/.test(value)) {
      throw new Error("ระบบยอมรับตัวอักษร");
    }

    await closeForm();
  });
} catch (error) {
  console.log("SETUP FAIL:", error.message);
  failed++;
} finally {
  await driver.quit();
}

console.log("\n===== MEMBER TEST =====");
console.log("PASS:", passed);
console.log("FAIL:", failed);
console.log("TOTAL:", passed + failed);

if (failed > 0) {
  process.exitCode = 1;
}
