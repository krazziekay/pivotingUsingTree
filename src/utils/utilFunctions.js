/**
 * Created by rosia on 7/17/17.
 **/

export let getRespectiveField = (fieldName = 'distributor_id') => {
    return fieldName.substr(0, fieldName.length - 3);
};

export let displayOtherNodes = (relatedField, selectedIndex) => {
    let fields = getRespectiveField(selectedIndex);
    let temp = {};
    if( relatedField.length > 1) {
        relatedField.map( (record) => {
            Object.keys(record).map( (each) => {
                if(each === fields) {
                    if(!temp[ record[each] ]) {
                        temp[record[each]] = record;
                    }
                    else {
                        temp[record[each]] = [].concat(temp[record[each]]).concat(record);
                    }
                }
            })
        } );
    }
    return temp;
};

export let getTotal = (dataArr, fieldName = 'quantity') => {
    let sum = 0;
    if(Array.isArray(dataArr)) {
        dataArr.map( (record) => {
            sum += parseFloat(record[fieldName]);
        })
    }
    else {
        sum = dataArr[fieldName];
    }
    sum = Math.round(sum * 100) / 100;
    return sum;
}

export let getPivotString = (dataArray, indexArray) => {
    let str ='';
    indexArray.map( (each) => {
        str += `${dataArray[getRespectiveField(each)]}_`;
    })
    return str;
}

export let create2DArrays = (rowLen, colLen) => {
    let arr = new Array(rowLen);
    for (let i=0;i<arr.length;i++) {
        arr[i] = new Array(colLen);
    }
    return arr;
}