import { Builder, By, until } from "selenium-webdriver";

const driver = await new Builder().forBrowser("chrome").build();
let passed = 0;
let failed = 0;

async function checkAlert(expected) {
  const alert = await driver.wait(until.alertIsPresent(), 5000);
  const actual = await alert.getText();
  await alert.accept();

  if (actual !== expected) {
    throw new Error(`คาดหวัง: ${expected} แต่พบ: ${actual}`);
  }
}

async function test(name, action) {
  try {
    await action();
    console.log("PASS:", name);
    passed++;
  } catch (error) {
    console.log("FAIL:", name, error.message);
    failed++;
  }
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

  const productsMenu = await driver.wait(
    until.elementLocated(By.xpath("//*[normalize-space(text())='สินค้า']")),
    10000,
  );
  await productsMenu.click();

  await driver.wait(
    until.elementLocated(By.xpath("//button[contains(.,'เพิ่มสินค้า')]")),
    10000,
  );

  async function openForm() {
    await driver
      .findElement(By.xpath("//button[contains(.,'เพิ่มสินค้า')]"))
      .click();
  }

  async function saveForm() {
    await driver
      .findElement(By.xpath("//button[contains(.,'บันทึก')]"))
      .click();
  }

  async function closeForm() {
    await driver
      .findElement(By.xpath("//button[contains(.,'ยกเลิก')]"))
      .click();
  }

  await test("ไม่กรอกชื่อสินค้า", async () => {
    await openForm();
    await saveForm();
    await checkAlert("กรุณากรอกชื่อสินค้า");
    await closeForm();
  });

  await test("ไม่กรอกราคาขาย", async () => {
    await openForm();

    const modal = await driver.findElement(By.css(".fixed.inset-0"));

    await modal
      .findElement(By.css("input:not([readonly])"))
      .sendKeys("สินค้าทดสอบ");

    await saveForm();
    await checkAlert("กรุณากรอกราคาสินค้าให้ถูกต้อง");
    await closeForm();
  });
} catch (error) {
  console.log("SETUP FAIL:", error.message);
  failed++;
} finally {
  await driver.quit();
}

console.log("\n===== PRODUCT TEST =====");
console.log("PASS:", passed);
console.log("FAIL:", failed);

if (failed > 0) process.exitCode = 1;
