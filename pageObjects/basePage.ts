import { BrowserContext, type Locator, type Page } from '@playwright/test';
import exp from 'constants';
import { promises as fs } from 'fs';

export class BasePage {
    readonly page: Page;
    readonly
            context: BrowserContext;
            cookiesModal: Locator;
            acceptButton: Locator;
            search: Locator;
            aeroplaneLoader: Locator;
            firstPrice: Locator;
            sortDropdown: Locator;
            sortMenu: Locator;
            directFlightsCheck: Locator;
            directFlight: Locator;

    public prices: { dateRange: string; price: string }[] = [];
  
    constructor(page: Page, context: BrowserContext) {
      this.page = page;
      this.context = context;
      this.cookiesModal = page.locator('uc-vertical-scroller')
      this.acceptButton = page.getByTestId('uc-accept-all-button')
      this.search = page.getByRole('button', {name: 'Szukaj lotu'})
      this.aeroplaneLoader = page.getByTestId('flights-loader-progress')
      this.firstPrice = page.getByTestId('formatted-price')
      this.sortDropdown = page.getByTestId('sorters-dropdown-trigger')
      this.sortMenu = page.getByTestId('sorters-menu')
      this.directFlightsCheck = page.getByTestId('None');
      this.directFlight = this.page.locator('[data-testid="filter-option"]', {hasText: 'Lot bezpośredni'})
    }

  async goto(departureCode, arrivalCode, departureDate, returnDate) {
    await this.page.goto(`https://www.esky.pl/flights/search/mp/${departureCode}/mp/${arrivalCode}?departureDate=${departureDate}&returnDate=${returnDate}&pa=1&py=0&pc=0&pi=0&sc=economy&sort=duration`)
  }

  async acceptCookies() {
    if (await this.cookiesModal.isVisible()) {
        // this.page.on('dialog', dialog => console.log(dialog.message()));
        await this.acceptButton.click()
        await this.acceptButton.waitFor({state: 'hidden'})
    }
    else {
        console.log('Cookies modal is not visible. Skipping cookies acceptance.');
    }
  }

  // Browser needs to much time to wait for aeroplaneLoader to finish load action.
  // async waitForLoaderToDissapear() {
  //   const loader = this.aeroplaneLoader
  //   try {
  //       await loader.waitFor({ state: 'hidden', timeout: 15000 });
  //       // this.page.waitForTimeout(1000)
  //     } catch (error) {
  //       console.error('Loader did not disappear in time:', error);
  //     }
  //     finally {
  //       await this.page.reload()
  //       this.waitForLoaderToDissapear()
  //     }
  // }

  async hasClass(locator: Locator, className: string): Promise<boolean> {
    return await locator.evaluate((element, className) => {
        return element.classList.contains(className);
    }, className);
}


  async getPrices(departureDay: number, returnDay: number, departureMonth: string, returnMonth: string) {
    let priceElements = this.firstPrice;

    this.acceptCookies()

    const priceText = await priceElements.nth(0).textContent();
    if (priceText) {
        // Formatowanie dat
        const formattedDepartureDay = departureDay.toString().padStart(2, '0');
        const formattedReturnDay = returnDay.toString().padStart(2, '0');
        const formattedDepartureMonth = departureMonth.toString()
        const formattedReturnMonth = returnMonth.toString()

        let dateRange = `${formattedDepartureDay}.${formattedDepartureMonth} - ${formattedReturnDay}.${formattedReturnMonth}`;

        if (await this.hasClass(this.directFlight, 'disabled')) {
          console.log('Lot ma przesiadki')
        }
        else {
          dateRange += " - bezposredni"
        }
        
        // Formatowanie ceny
        const price = priceText.trim();
        
        // Dodanie danych do publicznej zmiennej
        this.prices.push({ dateRange, price });
    }
}

  // Zapisywanie do pliku
  async writeToFile() {
    const content = this.prices.map(entry => `${entry.dateRange}, ${entry.price}`).join('\n');
    try {
        await fs.appendFile('ceny.txt', content, 'utf8');
        console.log('File written successfully');
    } catch (err) {
        console.error('Error writing file:', err);
    }
    }

    // Dodac do afterEach
  async clearCookies() {
    await this.context.clearCookies();
    console.log('Cookies cleared successfully');
  }

  async wholeProcess(howManyDays) {
    let departureMonth = '09';
    let returnMonth = '10'
    const departureDay: number[] = [25, 26, 27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    const prices: string[] = [];
    for (const day of departureDay) {
      let returnDay = day + howManyDays;
      let returnDayString: string;

      if (returnDay > 30) {
        returnDay -= 31; 
      }

      if (day < 15) {
        departureMonth = '10'
      }

      returnDayString = returnDay.toString().padStart(2, '0');
      let departureDayString = day.toString().padStart(2, '0');

      await this.goto('WAWA', 'TCI', `2024-${departureMonth}-${departureDayString}`, `2024-${returnMonth}-${returnDayString}`);
      if (await this.cookiesModal.isVisible()) {
        await this.acceptCookies();
      }
      
      await this.getPrices(day, returnDay, departureMonth, returnMonth);
    }

    await this.writeToFile()
  }
}