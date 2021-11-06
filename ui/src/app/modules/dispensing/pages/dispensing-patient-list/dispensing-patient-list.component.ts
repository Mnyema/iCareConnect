import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TableColumn } from 'src/app/shared/models/table-column.model';
import { TableConfig } from 'src/app/shared/models/table-config.model';
import { Api } from 'src/app/shared/resources/openmrs';
import { Visit } from 'src/app/shared/resources/visits/models/visit.model';
import { go } from 'src/app/store/actions';
import { AppState } from 'src/app/store/reducers';

@Component({
  selector: 'app-dispensing-patient-list',
  templateUrl: './dispensing-patient-list.component.html',
  styleUrls: ['./dispensing-patient-list.component.scss'],
})
export class DispensingPatientListComponent implements OnInit {
  visitsWithOrders$: Observable<MatTableDataSource<Visit>>;
  dispensingColumns: TableColumn[];
  loadingVisits: boolean;
  loadingVisitsError: string;
  tableConfig: TableConfig;
  constructor(
    private store: Store<AppState>,
    private api: Api,
    private router: Router
  ) {}

  ngOnInit() {}

  onSelectVisit(visit: Visit) {
    this.store.dispatch(
      go({ path: [`/dispensing/${visit.patientUuid}/${visit.uuid}`] })
    );
  }

  onSelectPatient(data): void {
    this.store.dispatch(
      go({ path: [`/dispensing//${data?.patient?.uuid}/${data?.visitUuid}`] })
    );
  }
}