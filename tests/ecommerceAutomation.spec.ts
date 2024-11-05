import { test, expect } from '@playwright/test';

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

  //Getting every product information
  await page.waitForSelector('.w-full.grid.xxxs\\:grid-cols-1.sm\\:grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4');
  const innerTexts = await page.$$eval('.w-full.grid.xxxs\\:grid-cols-1.sm\\:grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4 > *', elements => 
      elements.map(element => {
          const productNameandPrice = (element as HTMLElement).innerText; 
          const linkElement = element.querySelector('a'); 
          const href = linkElement ? linkElement.href : null; 

          const lines = productNameandPrice.split('\n').map(line => line.trim()).filter(line => line !== '');
      
          let nameofProduct = "";
          let priceofProduct = "";

          if (lines.length > 0) {
              nameofProduct = lines[0]; // First line is the product name
          }
  
          if (lines.length > 2) {
              priceofProduct = lines[2]; // Third line is the actual price
          }

          return { nameofProduct, priceofProduct, href };
      })
  );

  innerTexts.forEach(element => {
      if (element.nameofProduct && element.priceofProduct) {
          products.push({
              website: "Ibox",
              name: element.nameofProduct,
              price: element.priceofProduct,
              url: element.href
          });
      }
  });

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

  //Gettting every product information
  await page.waitForSelector('div[data-testid="divSRPContentProducts"] div.css-jza1fo div.css-5wh65g');
  const divs = await page.$$eval('div[data-testid="divSRPContentProducts"] div.css-jza1fo div.css-5wh65g', divs =>
      divs.map(div => {
          const productNames = (div as HTMLElement).innerText; 
          const linkElement = div.querySelector('a'); 
          const href = linkElement ? linkElement.href : null; 
      
          return { name: productNames, href };
      })
  );

  divs.forEach(text => {
    const lines = text.name.split('\n').map(line => line.trim()).filter(line => line !== '');

    const productNames = lines.find(line => line.includes('iPhone'));
    const priceLine = lines.find(line => line.startsWith('Rp'));

    //If a product name is found and the price line exists
    if (productNames && priceLine) {
        
        const newProduct: Product = {
            website: 'Tokopedia',
            name: productNames,
            price: priceLine,
            url: text.href || null 
        };
        
        products.push(newProduct);
    }
    });

  
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
