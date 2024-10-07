import { test, expect } from '@playwright/test';

test('Search and Validate Result for Ibox E-commerce', async ({ page }) => {
  //Define the product you want to search for
  const productName = 'iPhone 15 Pro';

  //Navigate to Ibox's homepage
  const websiteUrl = 'https://www.ibox.co.id/';
  const navigateUrl = await page.goto(websiteUrl);
  console.log('Succesfully open the website.');

 //Search product 
  await page.getByTestId('qa-searchfield').click();
  await page.getByTestId('qa-searchfield').fill(productName);
  await page.getByTestId('qa-searchfield').press('Enter');
  console.log(`Successfully Entered ${productName} for Product Search.`);

  //Validate the result is shown for the mentioned product.
  await page.getByRole('heading', { name: 'Hasil pencarian' });
  await page.getByText('iPhone 15 Pro');
  console.log('Search is successfully loaded.');

  //Click one of the product result
  const productDetails = await page.getByText('iPhone 15 Pro 128GB Natural');
  await productDetails.click();
  const productText = await productDetails.innerText();
  console.log(`Product Details of ${productText} are shown.`);

  //Getting Product Title
  const productTitleElement = page.getByRole('heading', { name: 'iPhone 15 Pro', exact: true }).first();
  const productTitleText = await productTitleElement.innerText();

  //Getting Product Price
  const productPriceElement = page.getByTestId('qa-pdp-price').first();
  const productPriceText = await productPriceElement.innerText();

  //Getting Product URL
  const metaContentUrl = await page.evaluate(() => {
      const metaTag = document.querySelector('meta[property="og:url"]');
      return metaTag ? metaTag.getAttribute('content') : null;
  });

  console.log(`Website: ${websiteUrl}`);
  console.log(`Product Name: ${productTitleText}`);
  console.log(`Product Price: ${productPriceText}`);
  console.log(`URL Product: ${metaContentUrl}`); 

});
