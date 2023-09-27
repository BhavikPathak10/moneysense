import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable, pipe, Subject,debounceTime,map, Subscription } from 'rxjs';
import { SafeboxService } from 'src/app/core/services/safebox.service';
import { ToastMessageService } from 'src/app/core/services/toast-message.service';
import { SafeBoxStore } from 'src/app/core/stores/safebox.store';
import Spreadsheet from 'x-data-spreadsheet';

@Component({
  selector: 'app-safe-box',
  templateUrl: './safe-box.component.html',
  styleUrls: ['./safe-box.component.scss']
})
export class SafeBoxComponent implements OnInit {

  workbook:any =undefined;

  @ViewChild('safeWrapper',{static:true}) safeWrapper!: ElementRef;

  subscription:Subscription[] =[];
  
  SAFEBOX_DATA:any = [];
  saveSafeBoxData$ = new Subject();

  constructor(private safeBoxStore : SafeBoxStore,private safeBoXService : SafeboxService, private toast : ToastMessageService) {
    this.subscription.push(
      this.saveSafeBoxData$.asObservable().pipe(debounceTime(3200)).subscribe((data:any)=>{
        let callback = null;
        if(this.SAFEBOX_DATA.id){
          callback = this.safeBoXService.updateSafeBox(this.SAFEBOX_DATA.id,data);
        }else{
          callback = this.safeBoXService.addSafeBoxData(data);
        }
        callback.subscribe((result)=>{
          this.toast.success('Safe Box data Auto Saved','close');
          this.safeBoXService.syncStore();
        })
      }),
      this.safeBoxStore.bindStore().subscribe((data)=>{
        this.SAFEBOX_DATA = data;
        if(this.workbook){
          this.workbook.loadData(this.SAFEBOX_DATA.value);
        }
      })
    )
  }

  ngOnInit(): void {
    let option :any = {
      mode: 'edit',
      showToolbar: true,
      showGrid: true,
      showContextmenu: true,
      view:{
        height:()=>{
          return this.safeWrapper.nativeElement.clientHeight;
        },
        width:()=>{
          return this.safeWrapper.nativeElement.clientWidth;
        },
      }
    };
    this.workbook = new Spreadsheet('#workbook-safe',option)
    .change((data)=>{
      this.saveSafeBoxData$.next(this.workbook.getData());
    });
  }

  ngAfterViewInit(){
    if(this.SAFEBOX_DATA && this.SAFEBOX_DATA.value && this.SAFEBOX_DATA.value.length > 0){
      this.workbook.loadData(this.SAFEBOX_DATA.value);
    }
  }

  ngOnDestroy(){
    this.subscription.map((sub)=>sub.unsubscribe());
  }
}