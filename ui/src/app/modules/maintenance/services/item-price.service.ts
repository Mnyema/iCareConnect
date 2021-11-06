import { Injectable } from '@angular/core';
import { from, Observable, of, zip } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { OpenmrsHttpClientService } from 'src/app/shared/modules/openmrs-http-client/services/openmrs-http-client.service';
import { Api, ConceptCreate } from 'src/app/shared/resources/openmrs';
import { getGroupedItems } from '../helpers/get-grouped-items.helper';
import { ItemPrice } from '../models/item-price.model';
import {
  PricingItem,
  PricingItemInterface,
} from '../models/pricing-item.model';

const item = {
  concept: {
    uuid: 'ae3e2c71-705c-4875-98c2-bc7cdb616793',
  },
  drug: {
    uuid: 'ae3e2c71-705c-4875-98c2-bc7cdb616793',
  },
  units: 'Days',
};

const itemPrices = [
  {
    item: {
      uuid: 'ae3e2c71-705c-4875-98c2-bc7cdb616793',
      display: 'Item One',
    },
    paymentType: {
      uuid: 'ae3e2c71-705c-4875-98c2-bc7cdb616793',
    },
    paymentScheme: {
      uuid: 'ae3e2c71-705c-4875-98c2-bc7cdb616793',
    },
    price: 4000,
  },
  {
    item: {
      uuid: 'ae3e2c71-705c-4875-98c2-bc7cdb616793',
      display: 'Item One',
    },
    paymentType: {
      uuid: 'ae3e2c71-705c-4875-98c2-bc7cdb616793',
    },
    paymentScheme: {
      uuid: 'fast-uuid',
    },
    price: 4500,
  },
  {
    item: {
      uuid: 'ae3e2c71-705c-4875-98c2-bc7cdb616793',
      display: 'Item One',
    },
    paymentType: {
      uuid: 'ae3e2c71-705c-4875-98c2-bc7cdb616793',
    },
    paymentScheme: {
      uuid: 'timiza-uuid',
    },
    price: 4700,
  },
];

@Injectable()
export class ItemPriceService {
  constructor(private httpClient: OpenmrsHttpClientService, private api: Api) {}

  getItemPrices(paymentSchemes): Observable<any[]> {
    return this.httpClient.get('icare/itemprice?limit=20&startIndex=0').pipe(
      map((result) =>
        getGroupedItems(
          result.map((resultItem) => new ItemPrice(resultItem)),
          paymentSchemes
        )
      )
    );
  }

  createItem(item: any, paymentSchemes: any[]): Observable<any> {
    // create concept drug if it is drug item
    if (item.isDrug) {
      return of(item);
    }

    // return this.httpClient.post('/care/item', item);
    const concept: ConceptCreate = {
      names: [{ name: item?.name, locale: 'en' }],
      datatype: 'N/A',
      conceptClass: item?.class,
    };

    return from(this.api.concept.createConcept(concept)).pipe(
      switchMap((res) => {
        return this.httpClient
          .post('icare/item', {
            concept: {
              uuid: res.uuid,
            },
            unit: 'Session',
          })
          .pipe(
            map((itemRes: any) => {
              const priceItems: ItemPrice[] = paymentSchemes.map(
                (paymentScheme) =>
                  new ItemPrice({
                    item: {
                      uuid: itemRes?.uuid,
                      display: itemRes?.display || item?.name,
                    },
                    paymentType: paymentScheme.paymentType,
                    paymentScheme,
                  })
              );

              return getGroupedItems(priceItems, paymentSchemes);
            })
          );
      })
    );
  }

  updateItemPrice(itemPrice: any): Observable<any> {
    return this.httpClient.post('icare/itemprice', itemPrice);
  }

  updateItemPrices(itemPrices: any[]): Observable<any[]> {
    return zip(...itemPrices.map(this.updateItemPrice));
  }

  // TODO: Move this method to appropriate location
  getPaymentTypes() {
    const conceptUuids = [
      '00000100IIIIIIIIIIIIIIIIIIIIIIIIIIII',
      // '00000105IIIIIIIIIIIIIIIIIIIIIIIIIIII',
      // '00000106IIIIIIIIIIIIIIIIIIIIIIIIIIII',
      // '00000107IIIIIIIIIIIIIIIIIIIIIIIIIIII',
    ];
    return zip(
      ...conceptUuids.map((concept) =>
        this.httpClient.get(`concept/${concept}`)
      )
    );
  }

  // TODO:Move this logic somewhere else

  getConceptClasses() {
    return this.httpClient.get('conceptclass').pipe(map((res) => res.results));
  }
}