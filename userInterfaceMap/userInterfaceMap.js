import { LightningElement,wire,track } from 'lwc';
import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';

export default class UserInterfaceMap extends LightningElement {
    showByLocation = false;
    showByCoordinates = false;
    selectTypeValue='';
    showMap = false;
    markers =[];
    longitutdeValue;
    latitudeValue;

    @track selectedCountry;
    @track selectedState;
    @track isEmpty = false;

    @track countryValues =[];
    @track stateValues =[];
    @track cityName;
    controlValues;
    totalDependentValues = [];

    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    objectInfo;

    @wire(getPicklistValuesByRecordType, { objectApiName: ACCOUNT_OBJECT, recordTypeId: '$objectInfo.data.defaultRecordTypeId'})
    countryFieldValues({data,error}){
        if(data){

            let countryOptions = [{label:'--None--', value:'--None--'}];
            data.picklistFieldValues.BillingCountryCode.values.forEach(key => {
                countryOptions.push({
                    label : key.label,
                    value: key.value
                })
            });

            this.countryValues = countryOptions;

            let stateOptions = [{label:'--None--', value:'--None--'}];

            this.controlValues = data.picklistFieldValues.BillingStateCode.controllerValues;
            // Account State dependent Field Picklist values
            this.totalDependentValues = data.picklistFieldValues.BillingStateCode.values;

            this.totalDependentValues.forEach(key => {
                stateOptions.push({
                    label : key.label,
                    value: key.value
                })
            });

            this.stateValues = stateOptions;
        }
    }

    handleCountryChange(event) {
        // Selected Country Value
        this.selectedCountry = event.target.value;
        this.isEmpty = false;
        let dependValues = [];

        if(this.selectedCountry) {
            // if Selected country is none returns nothing
            if(this.selectedCountry === '--None--') {
                this.isEmpty = true;
                dependValues = [{label:'--None--', value:'--None--'}];
                this.selectedCountry = null;
                this.selectedState = null;
                return;
            }

            // filter the total dependent values based on selected country value 
            this.totalDependentValues.forEach(conValues => {
                if(conValues.validFor[0] === this.controlValues[this.selectedCountry]) {
                    dependValues.push({
                        label: conValues.label,
                        value: conValues.value
                    })
                }
            })

            this.stateValues = dependValues;
        }
    }

    handleStateChange(event) {
        this.selectedState = event.target.value;
    }

    handleCityChange = (event) =>{
        this.cityName = event.target.value;
    }

    handleLongitute = (event) =>{
        this.longitutdeValue = event.target.value;
    }

    handleLatitude = (event) =>{
        this.latitudeValue = event.target.value;
    }

    searchType = (event) =>{
        console.log(event.target.value);
        this.selectTypeValue = event.target.value;

        // const style = document.createElement('style');
        // style.innerText = `c-wc-locations .slds-map {
        // min-width: 0 !important;
        // }`;
        // this.template.querySelector('lightning-map').appendChild(style);

        if(this.selectTypeValue === 'searchLocation'){
            this.showByLocation = true;
            this.showByCoordinates = false;
        }
        else{
            this.showByLocation = false;
            this.showByCoordinates = true;
        }
    }


    searchOnMap = () =>{
        this.showMap = true;
        if(this.selectTypeValue === 'searchLocation'){
            this.markers = [
                {
                    location: {
                        City: this.cityName,
                        State: this.selectedState,
                        Country: this.selectedCountry
                    }
                }
            ];
        }
        else{
            this.markers = [
                {
                    location: {
                        Latitude: this.longitutdeValue,
                        Longitude: this.latitudeValue,
                    }
                }
            ];
        }
       
    }

    get disbaleSearchBtn(){
        if(this.showByLocation || this.showByCoordinates){
            return false;
        }
        else{
            return true;
        }

    }
}