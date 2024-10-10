import { test, expect } from '@playwright/test';
import { load } from 'cheerio';

interface Product {
  website: string;
  name: string;
  price: string;
  url: string | null; 
}

const products: Product[] = []; //array for products
const productName = 'iPhone 15 Pro';

test('Search and Validate Result for Ibox E-commerce', async ({ page }) => {
  
  //Define Ibox URL
  const websiteUrl = 'https://www.ibox.co.id/';

  //Navigate to Ibox's homepage
  try {
  const navigateUrl = await page.goto(websiteUrl, { timeout: 20000 });
  console.log('Succesfully open the website www.ibox.co.id');
  } catch(error) {
    if (error.name === 'TimeoutError')
    {console.log(`Navigation to ${websiteUrl} timed out.`)}
    else
    {console.error(`Failed to navigate to ${websiteUrl}:`, error);}
  };

  //For handling Ads Popup if it's shown
  const iboxPopup = await page.getByLabel('Popup', { exact: true }).getByRole('link');
  await iboxPopup.waitFor({ state: 'visible' });

  if (await iboxPopup.isVisible()) {
    console.log('Pop-up is visible, attempting to close it.');
    
    //To close the popup
    const closePopupButton = await page.getByLabel('Close Popup').first();
    if (await closePopupButton.isVisible()){
      await closePopupButton.click();
      console.log('Pop-up closed successfully.');
    }
    else {console.log('Close button is not visible.')};
  } 
  else {
    console.log('No pop-up was shown.');
  }
  

 //Search product 
  await page.getByTestId('qa-searchfield').fill(productName);
  await page.getByTestId('qa-searchfield').press('Enter');
  console.log(`Successfully Entered ${productName} for Product Search.`);

  //Validate the result is shown for the mentioned product
  await page.getByRole('heading', { name: 'Hasil pencarian' });
  await page.getByText('iPhone 15 Pro');
  console.log('Search is successfully loaded.');

  //Click one of the product result
  const productDetails = await page.locator('.xxxs\\:w-full > .inline-flex').first();
  await productDetails.click();
  console.log(`Product Details are shown.`);

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

  products.push({ website: 'Ibox', name: productTitleText, price: productPriceText, url: metaContentUrl });

});

test('Search and Validate Result for Tokopedia E-commerce', async ({ page }) => {

  //Define Tokopedia URL
  const tokpedWebsiteUrl = 'https://www.tokopedia.com/';

  //Navigate to Tokopedia's homepage
  try {
    const navigateUrl = await page.goto(tokpedWebsiteUrl, { timeout: 20000 });
    console.log('Succesfully open the website www.tokopedia.com');
  } catch(error) {
    if (error.name === 'TimeoutError')
      {console.log(`Navigation to ${tokpedWebsiteUrl} timed out.`)}
      else
      {console.error(`Failed to navigate to ${tokpedWebsiteUrl}:`, error);}
  }

  //For handling Login with google popup if it's shown
  const popupSelectorXPath = '//*[@id="credentials-picker-container"]';
  const closeButtonXPath = '//*[@id="close"]';

  const isPopupVisible = await page.locator(popupSelectorXPath).isVisible();
    if (isPopupVisible) {
      console.log('Pop-up is visible, attempting to close it.');
      
      //
      const closeButton = page.locator(closeButtonXPath);
      await closeButton.click();
      console.log('Pop-up closed successfully.');
    } else {
      console.log('No pop-up was shown.');
    }

  //Search product 
  await page.getByPlaceholder('Cari di Tokopedia').fill(productName);
  await page.getByPlaceholder('Cari di Tokopedia').press('Enter');
  console.log(`Successfully Entered ${productName} for Product Search.`);

  //Validate the result is shown for the mentioned product
  await page.getByText(`Menampilkan 1 - 60 barang ${productName}`);
  console.log('Search is successfully loaded.');

  const tokpedGridElement = page.getByTestId('divSRPContentProducts');

  const tokpedGridInnerText = await tokpedGridElement.innerText();
  const tokpedGridHTML = await tokpedGridElement.innerHTML();

  const $ = load(tokpedGridHTML);

  const hrefs: string[] = [];
    $('a').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
            hrefs.push(href);
        }
    });
    const top4Hrefs = hrefs.slice(0, 4);

    const lines = tokpedGridInnerText.trim().split('\n').map(line => line.trim());

    for (let i = 0; i < lines.length && i < 8 * 4; i += 8) {//Not every product has 8 lines, there is limitation on the innerText
      const discountPercentage = lines[i] || 'N/A';
      const productName = lines[i + 1] || 'N/A';
      const originalPrice = lines[i + 2] || 'N/A';
      const discountedPrice = lines[i + 3] || 'N/A';
      const rating = lines[i + 4] || 'N/A';
      const sold = lines[i + 5] || 'N/A';
      const seller = lines[i + 6] || 'N/A';
      const location = lines[i + 7] || 'N/A';

      const href = top4Hrefs[Math.floor(i / 8)] || null; 

      //Push product details into the products array
      products.push({
          website: 'Tokopedia',
          name: productName,
          price: originalPrice,
          //discountedPrice: discountedPrice,
          //rating: rating,
          //sold: sold,
          //seller: seller,
          //location: location,
          //discountPercentage: discountPercentage,
          url: href
      });
  }

});

test('Combine and Sort Products by Price', async () => {
  //Function to parse price and convert it to a number for comparison
  const parsePrice = (price) => {
      return parseFloat(price.replace(/[^0-9.-]+/g,"")); //Remove currency symbols and parse as float
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
