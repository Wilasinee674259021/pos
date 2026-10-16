import { Builder, By } from "selenium-webdriver";

async function runTest() {
  let driver;

  try {
    driver = await new Builder().forBrowser("chrome").build();

    await driver.get("http://localhost:5173/");

    const body = await driver.findElement(By.tagName("body"));
    const text = await body.getText();

    if (text.trim().length === 0) {
      throw new Error("หน้าเว็บไม่มีข้อความ");
    }

    console.log("PASS: เปิดหน้าเว็บ POS สำเร็จ");
  } catch (error) {
    console.log("FAIL:", error.message);
    process.exitCode = 1;
  } finally {
    if (driver) await driver.quit();
  }
}

runTest();