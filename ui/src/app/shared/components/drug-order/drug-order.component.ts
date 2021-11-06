import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChildren,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { find } from 'lodash';
import { Observable, zip } from 'rxjs';
import { take } from 'rxjs/operators';
import { AppState } from 'src/app/store/reducers';
import { getProviderDetails } from 'src/app/store/selectors/current-user.selectors';
import { FormComponent } from '../../modules/form/components/form/form.component';
import { Dropdown } from '../../modules/form/models/dropdown.model';
import { FormValue } from '../../modules/form/models/form-value.model';
import { ProviderGet } from '../../resources/openmrs';
import { DrugOrderMetadata } from '../../resources/order/models/drug-order-metadata.model';
import { DrugOrderObject } from '../../resources/order/models/drug-order.model';
import { DrugOrdersService } from '../../resources/order/services';
import { Patient } from '../../resources/patient/models/patient.model';
import { uniq, keyBy } from 'lodash';
import { getLocationsByTagName } from 'src/app/store/selectors';

@Component({
  selector: 'app-drug-order',
  templateUrl: './drug-order.component.html',
  styleUrls: ['./drug-order.component.scss'],
})
export class DrugOrderComponent implements OnInit {
  @ViewChildren(FormComponent) formComponents: FormComponent[];
  @Input() drugOrder: DrugOrderObject;
  @Input() fromDispensing: boolean;
  @Input() showAddButton: boolean;
  @Input() hideActionButtons: boolean;
  @Input() encounterUuid: string;
  @Input() patient: Patient;
  @Input() isFromDoctor: boolean;
  @Input() locations: any[];

  drugsConceptsField: any;
  @Output() drugOrdered = new EventEmitter<any>();
  @Output() drugQuantity = new EventEmitter<number>();
  @Output() cancelForm = new EventEmitter<any>();
  @Output() formUpdate = new EventEmitter<any>();
  drugOrderDetails: any = {};
  isTheOrderFromDoctor: boolean = false;

  drugOrderMetadata: DrugOrderMetadata;
  drugFormField: Dropdown;
  loadingMetadata: boolean;
  loadingMetadataError: string;
  countOfDispensingFormFieldsWithValues: number = 0;
  keysWithData: string[] = [];
  provider: ProviderGet;
  drugOrderFormsMetadata$: Observable<any>;
  provider$: Observable<ProviderGet>;
  dispensingLocations$: Observable<any>;
  constructor(
    private drugOrderService: DrugOrdersService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.isTheOrderFromDoctor =
      this.drugOrder && this.drugOrder.drugUuid ? false : true;

    this.loadingMetadata = true;

    this.drugOrderFormsMetadata$ = this.drugOrderService.getDrugOrderMetadata(
      this.drugOrder,
      this.locations,
      this.fromDispensing
    );

    this.provider$ = this.store.pipe(select(getProviderDetails));
    this.dispensingLocations$ = this.store.select(getLocationsByTagName, {
      tagName: 'Dispensing Unit',
    });
    // zip(
    //   this.drugOrderService.getDrugOrderMetadata(
    //     this.drugOrder,
    //     this.locations,
    //     this.fromDispensing
    //   ),
    //   this.store.pipe(select(getProviderDetails)).pipe(take(1))
    // ).subscribe(
    //   (res) => {
    //     console.log('res', res);
    //     this.loadingMetadata = false;
    //     this.drugOrderMetadata = res[0];
    //     this.drugFormField = this.drugOrderMetadata.drugFormField;
    //     this.provider = res[1];
    //   },
    //   (error) => {
    //     this.loadingMetadata = false;
    //     this.loadingMetadataError = error;
    //   }
    // );
  }

  onOrderingDrug(data): void {
    this.drugOrdered.emit(data);
  }

  onFormUpdate(data): void {
    this.formUpdate.emit(data);
  }

  onChangeDrugQuantity(data): void {
    this.drugQuantity.emit(data);
  }

  addDrugOrderToTheList(drugOrder): void {
    Object.keys(drugOrder).length > 0
      ? this.drugOrdered.emit({
          ...drugOrder,
          providerUuid: this.provider?.uuid,
          patientUuid: this.patient?.id,
          encounterUuid: this.encounterUuid,
          orderType: this.drugOrderMetadata.orderType,
          careSetting: 'OUTPATIENT',
          numRefills: 1,
        })
      : '';

    this.formComponents.forEach((form) => {
      form.onClear();
    });

    this.drugOrderDetails = {};
  }

  updateDrugOrder(drugOrder, drugOrderDetails) {
    const newDrugOrder = { ...drugOrder, ...drugOrderDetails };
    const data = {
      order: newDrugOrder,
      isTheOrderFromDoctor: this.isFromDoctor,
      patient: this.patient,
      provider: this.provider,
      orderType: this.drugOrderMetadata?.orderType,
    };
    this.drugOrdered.emit(data);
  }

  onCancel(e) {
    e.stopPropagation();
    this.cancelForm.emit();
  }
}