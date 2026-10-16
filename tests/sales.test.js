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
      await alert.accept();
    } catch {}
  }
}

async function findButton(text) {
  return await driver.wait(
    until.elementLocated(
      By.xpath(`//button[contains(normalize-space(.),'${text}')]`),
    ),
    10000,
  );
}

async function clickButton(text) {
  const button = await findButton(text);

  await driver.wait(until.elementIsVisible(button), 5000);

  await button.click();
}

async function checkAlert(expected) {
  const alert = await driver.wait(until.alertIsPresent(), 5000);

  const actual = await alert.getText();
  await alert.accept();

  if (actual !== expected) {
    throw new Error(`Expected: ${expected} | Actual: ${actual}`);
  }
}

async function getCashInputs() {
  return await driver.findElements(
    By.css('input[placeholder="จำนวนเงินที่รับ"]'),
  );
}

async function openSalesPage() {
  const existing = await driver.findElements(
    By.xpath("//button[contains(.,'ชำระเงิน')]"),
  );

  if (existing.length > 0) {
    console.log("อยู่หน้าคิดเงินแล้ว");
    return;
  }

  const menu = await driver.wait(
    until.elementLocated(
      By.xpath(
        "//*[self::a or self::button][contains(normalize-space(.),'หน้าคิดเงิน')]",
      ),
    ),
    10000,
  );

  await driver.wait(until.elementIsVisible(menu), 5000);

  await menu.click();

  console.log("เปิดเมนูหน้าคิดเงินสำเร็จ");

  await driver.wait(
    until.elementLocated(By.xpath("//button[contains(.,'ชำระเงิน')]")),
    10000,
  );
}

try {
  await driver.get("http://localhost:5173/");

  const username = await driver.wait(
    until.elementLocated(By.css('input[autocomplete="username"]')),
    10000,
  );

  await username.sendKeys("admin");

  await driver
    .findElement(By.css('input[autocomplete="current-password"]'))
    .sendKeys("1234");

  await driver.findElement(By.css('button[type="submit"]')).click();

  await driver.wait(async () => {
    const loginFields = await driver.findElements(
      By.css('input[autocomplete="username"]'),
    );

    return loginFields.length === 0;
  }, 10000);

  await openSalesPage();

  await test("SALES-01 ตะกร้าว่างไม่สามารถชำระเงิน", async () => {
    const button = await findButton("ชำระเงิน");

    const disabled = await button.getAttribute("disabled");

    if (disabled === null) {
      throw new Error("ปุ่มชำระเงินยังสามารถกดได้");
    }
  });

  // SALES-02 เลือกเงินสด
  await test("SALES-02 เลือกวิธีชำระเงินสด", async () => {
    await clickButton("เงินสด");

    await driver.wait(
      until.elementLocated(By.css('input[placeholder="จำนวนเงินที่รับ"]')),
      5000,
    );
  });

  await test("SALES-03 ตะกร้าว่างไม่สามารถเลือก QR", async () => {
    await clickButton("QR");

    await checkAlert("กรุณาเพิ่มสินค้าก่อนเลือก QR");

    // ตรวจว่าหน้าคิดเงินยังอยู่
    const paymentButton = await findButton("ชำระเงิน");

    if (!(await paymentButton.isDisplayed())) {
      throw new Error("ไม่พบหน้าคิดเงินหลังปิดแจ้งเตือน");
    }
  });

  await test("SALES-04 เลือกวิธีชำระบัตร", async () => {
    await clickButton("บัตร");

    const cashInputs = await getCashInputs();

    const visibleCashInputs = [];

    for (const input of cashInputs) {
      if (await input.isDisplayed()) {
        visibleCashInputs.push(input);
      }
    }

    if (visibleCashInputs.length > 0) {
      throw new Error("ช่องรับเงินสดยังแสดงหลังเลือกบัตร");
    }
  });
} catch (error) {
  console.log("SETUP FAIL:", error.message);
  failed++;
} finally {
  await driver.quit();
}

console.log("\n===== SALES TEST =====");
console.log("PASS:", passed);
console.log("FAIL:", failed);
console.log("TOTAL:", passed + failed);

if (failed > 0) {
  process.exitCode = 1;
}
