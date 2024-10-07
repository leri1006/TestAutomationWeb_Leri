import { test, expect } from '@playwright/test';

interface Product {
  website: string;
  name: string;
  price: string;
  url: string | null; 
}

const products: Product[] = []; //array for products

test('Search and Validate Result for Ibox E-commerce', async ({ page }) => {
  //Define the product you want to search for
  const productName = 'iPhone 15 Pro';

  //Navigate to Ibox's homepage
  const websiteUrl = 'https://www.ibox.co.id/';
  const navigateUrl = await page.goto(websiteUrl, { timeout: 50000 });
  console.log('Succesfully open the website www.ibox.co.id');

 //Search product 
  await page.waitForSelector('[data-testid="qa-searchfield"]', { timeout: 5000 });
  await page.getByTestId('qa-searchfield').click();
  await page.getByTestId('qa-searchfield').fill(productName);
  await page.getByTestId('qa-searchfield').press('Enter');
  console.log(`Successfully Entered ${productName} for Product Search.`);

  //Validate the result is shown for the mentioned product
  await page.getByRole('heading', { name: 'Hasil pencarian' });
  await page.getByText('iPhone 15 Pro');
  console.log('Search is successfully loaded.');

  //Click one of the product result
  const productDetails = await page.getByText('iPhone 15 Pro 128GB Natural');
  await productDetails.click();
  const productText = await productDetails.innerText();
  console.log(`Product Details of ${productText} are shown.`);

  //Getting Product Name
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

  products.push({ website: websiteUrl, name: productTitleText, price: productPriceText, url: metaContentUrl });


  /* console.log(`Website: ${websiteUrl}`);
  console.log(`Product Name: ${productTitleText}`);
  console.log(`Product Price: ${productPriceText}`);
  console.log(`URL Product: ${metaContentUrl}`); */

});

test('Search and Validate Result for Tokopedia E-commerce', async ({ page }) => {
  //Define the product you want to search for
  const productName = 'iPhone 15 Pro';

  //Navigate to Tokopedia's homepage
  const tokpedWebsiteUrl = 'https://www.tokopedia.com/';
  const navigateUrl = await page.goto(tokpedWebsiteUrl, { timeout: 50000 });
  console.log('Succesfully open the website www.tokopedia.com');

  //Search product 
  await page.getByPlaceholder('Cari di Tokopedia').click();
  await page.getByPlaceholder('Cari di Tokopedia').fill(productName);
  await page.getByPlaceholder('Cari di Tokopedia').press('Enter');
  console.log(`Successfully Entered ${productName} for Product Search.`);

  //Validate the result is shown for the mentioned product
  await page.getByText(`Menampilkan 1 - 60 barang ${productName}`);
  console.log('Search is successfully loaded.');

 
  //Click one of the product result
  const tokpedProductDetails = await page.getByTestId('CPMProductItem').first().click();
  console.log(`Product Details are shown.`);

  //Getting Product Name
  const tokpedProductNameElement = page.getByTestId('lblPDPDetailProductName').first();
  const tokpedProductName = await tokpedProductNameElement.innerText();
  
  //Getting Product Price
  const tokpedProductPriceElement = page.getByTestId('lblPDPDetailProductPrice').first();
  const tokpedProductPrice = await tokpedProductPriceElement.innerText();

  //Getting Product URL
  const tokpedmetaContentUrl = await page.evaluate(() => {
      const metaTag = document.querySelector('meta[property="og:url"]');
      return metaTag ? metaTag.getAttribute('content') : null;
  });

  products.push({ website: tokpedWebsiteUrl, name: tokpedProductName, price: tokpedProductPrice, url: tokpedmetaContentUrl });


  /*console.log(`Website: ${tokpedWebsiteUrl}`);
  console.log(`Product Name: ${tokpedProductName}`);
  console.log(`Product Price: ${tokpedProductPrice}`);
  console.log(`URL Product: ${tokpedmetaContentUrl}`); */

});

test('Combine and Sort Products by Price', async () => {
  //Function to parse price and convert it to a number for comparison
  const parsePrice = (price) => {
      return parseFloat(price.replace(/[^0-9.-]+/g,"")); // Remove currency symbols and parse as float
  };

  //Sort the products array based on product price
  const sortedProducts = products.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));

  //Log the sorted product details
  console.log('Sorted Products by Price:');
  sortedProducts.forEach(product => {
      console.log(`Website: ${product.website}`);
      console.log(`Product Name: ${product.name}`);
      console.log(`Product Price: ${product.price}`);
      console.log(`URL Product: ${product.url}`);
  });
});
