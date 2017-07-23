import React, { Component } from 'react';
import data from './csvSamples/sample6.json';
import Trie from './utils/trie';
import _find from 'lodash/find';
import _indexOf from 'lodash/indexOf';
import _includes from 'lodash/includes';
import { getRespectiveField , create2DArrays , getPivotString , checkSubset } from './utils/utilFunctions';

let tree = new Trie();
const CODELENGTH = 6;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: data.slice(0, 20),
            depthArray : [],
            leafNodes: [],
            valueFields: ['quantity', 'price'],
            columnPivotField: [],
            rowPivotField: [],
            rowFields: [],
            columnFields: [],
            rowHeaders: [],
            columnHeaders : [],
            pivotedArray: []
        };
    }

    componentDidMount() {
        let convertedHashKeys = this.convertDataIntoHashKeys(this.state.data);
        this.setState({
            data: [],
            tree : convertedHashKeys.tree,
            depthArray: convertedHashKeys.depth
        }, () => {
            this.getLeafNodes();
        });
    }

    onChange = (e) => {
        switch(e.target.name) {
            case 'rowField' :
                if (_indexOf(this.state.rowFields, e.target.value) === -1 && _indexOf(this.state.columnFields, e.target.value) === -1) {
                    this.setState({
                        rowFields: [].concat(this.state.rowFields).concat(e.target.value)
                    }, () => this.setRowFields());
                }
                break;
            case 'columnField' :
                if(_indexOf(this.state.rowFields, e.target.value) === -1 && _indexOf(this.state.columnFields, e.target.value) === -1) {
                    this.setState({
                        columnFields: [].concat(this.state.columnFields).concat(e.target.value)
                    }, () => this.setColumnFields());
                }
                break;
            case 'valueFields' :
                this.setState({
                    valueFields: e.target.value
                });
                break;
            default:
                return;
        }
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     *
     This function converts each individual data into corresponding hashmap or ids, merges them
     and creates a branch in the Trie after converting each data
     * @param dataArray
     * @returns {{tree: Trie, depth: Array}}
     */
    convertDataIntoHashKeys = (dataArray) => {
        let depths = [];
        let keysLength = 0;
        dataArray.map( (eachData) =>{
            let mergeFactor = '';
            let leafNodes = {}, depthIndex= 1;
            let hashKey = '';
            Object.keys(eachData).map( (props) => {
                if(_includes(props, 'id')) {
                    mergeFactor += this.encodeKeys(eachData[props]);
                    hashKey += this.encodeKeys(eachData[props]);
                    if( keysLength < Object.keys(eachData).length ) {//Adding depths in each node in the tree
                        depths.push({ fieldName: props, depth: CODELENGTH * (depthIndex) });
                        depthIndex++;
                    }
                }
                else {
                    leafNodes[props] = eachData[props];
                }
                keysLength++;
            });
            tree.add(mergeFactor, leafNodes, hashKey);
        });

        return {tree: tree, depth: depths};
    }

    /**
     * This function encodes the ids of the given data
     * @param keys
     * @returns {string}
     */
    encodeKeys = (keys) => {
        let zeroes = '000000';
        return zeroes.substr(0, zeroes.length - keys.length) + keys;
    }

    /**
     * These functions are for the data manipulation as per rowFields and columnFields
     */
    setRowFields = () => {
        if(this.state.rowPivotField.length === 0) {
            let leafNodes = [];
            let searchDepthValue = _find(this.state.depthArray, {fieldName: this.state.rowFields[0]});
            let rowData = tree.traverse(searchDepthValue.depth);
            rowData.map( (eachNode, eachNodeIndex) => {
                leafNodes[eachNodeIndex] = tree.getLeafNodes(eachNode,this.state.valueFields);
            });
            let resultArray = this.getHeaders(this.state.rowFields, leafNodes);
            this.setState({
                rowPivotField: leafNodes,
                rowHeaders : resultArray
            }, () => this.setResults());
        }
        else{
            let resultArray = this.getHeaders(this.state.rowFields, this.state.rowPivotField);
            this.setState({
                rowHeaders: resultArray
            }, () => this.setResults());
         }

    }
    setColumnFields = () => {
        if(this.state.columnPivotField.length === 0) {
            let columns = [];
            let leafNodes = [];
            this.state.columnFields.map( (columnField) => {
                let searchDepthValue = _find(this.state.depthArray, {fieldName: columnField});
                let columnData = tree.traverse(searchDepthValue.depth);

                columns = columnData.map( (eachNode, eachNodeIndex) => {
                    leafNodes[eachNodeIndex] = tree.getLeafNodes(eachNode,this.state.valueFields);
                });
            });
            let resultArray = this.getHeaders(this.state.columnFields, leafNodes);
            this.setState({
                columnPivotField: leafNodes,
                columnHeaders : resultArray
            }, () => this.setResults());
        }
        else {
            let resultArray = this.getHeaders(this.state.columnFields, this.state.columnPivotField);
            this.setState({
                columnHeaders: resultArray
            }, () => this.setResults());
        }
    }

    /**
     * This helper function gets the required row/column Header data in desired array form
     * @param fields
     * @param pivotArray
     * @returns {Array}
     */
    getHeaders = (fields, pivotArray) => {
        let nextRows = [], resultArray = [];
        pivotArray.map( (pivotData) => {
            pivotData.map((leaf) => {
                let str = getPivotString(leaf, fields);
                if (!nextRows[str]) {
                    nextRows[str] = true;
                    resultArray.push(fields.map(field => leaf[getRespectiveField(field)]));
                }
            });
        });
        return resultArray;
    }

    /**
     * This function gets the required data for given row(s) and given column(s)
     */
    setResults = () => {
        let results = create2DArrays(this.state.rowHeaders.length, this.state.columnHeaders.length);
        if ( this.state.rowHeaders.length >= 1 && this.state.columnHeaders.length < 1 ) {
           results = [];
           this.state.rowHeaders.map( (row, rowIndex) => {
               this.state.rowPivotField.map( (data) =>{
                   data.map( (eachData) => {
                       let combinedRowCol = [].concat(row);
                       if( checkSubset( Object.values(eachData), combinedRowCol) ) {
                           if(results[rowIndex] === undefined) {
                               results[rowIndex] = 0;
                           }
                           results[rowIndex] = parseFloat(results[rowIndex]) + parseFloat(eachData[this.state.valueFields[1]]);
                       }
                   });
               });
           })
       }
        else if ( this.state.columnHeaders.length >= 1 && this.state.rowHeaders.length < 1 ){
            results = [];
            this.state.columnHeaders.map( (col, colIndex) => {
                this.state.columnPivotField.map( (data) =>{
                    data.map( (eachData) => {
                        let combinedRowCol = [].concat(col);
                        if( checkSubset( Object.values(eachData), combinedRowCol) ) {
                            if(results[colIndex] === undefined) {
                                results[colIndex] = 0;
                            }
                            results[colIndex] = parseFloat(results[colIndex]) + parseFloat(eachData[this.state.valueFields[1]]);
                        }
                    });
                });
            })
        }
        else if( this.state.columnHeaders.length > 1 && this.state.rowHeaders.length > 1 ){
            this.state.rowHeaders.map( (row, rowIndex) => {
                this.state.columnHeaders.map( (col, colIndex) => {
                    this.state.rowPivotField.map( (data) =>{
                        data.map( (eachData) => {
                            let combinedRowCol = [].concat(row).concat(col);
                            if( checkSubset( Object.values(eachData), combinedRowCol) ) {
                                if(results[rowIndex][colIndex] === undefined) {
                                    results[rowIndex][colIndex] = 0;
                                }
                                results[rowIndex][colIndex] = parseFloat(results[rowIndex][colIndex]) + parseFloat(eachData[this.state.valueFields[1]]);
                            }
                        });
                    });
                });
            });
        }
        this.setState({
            pivotArray: results
        });
    }

    /**
     * This function gets the leafNodes of the tree
     */
    getLeafNodes = () => {
        let leafNodes = tree.getLeafNodes('', this.state.valueFields);
        this.setState({
            leafNodes: leafNodes
        } );
    }


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    render() {
        return (
          <div className="App">
              <div className="row bordered">
                  <div className="col-md-2">
                      <select className="form-control" name="valueFields" onChange={this.onChange}>
                          <option value="quantity" >quantity</option>
                          <option value="price" >price</option>
                      </select>
                  </div>
                  <div className="col-md-10 row">
                      {
                          this.state.columnFields ? this.state.columnFields.map( col =>
                              <div className="col-md-2 bordered">{getRespectiveField(col)}</div>
                          ) : null
                      }
                      <div className="col-md-3">
                          <select className="form-control" name="columnField" onChange={this.onChange}>
                              <option selected="selected">--Select an option--</option>
                              {this.state.depthArray.map( (field, index) =>
                                  <option value={field.fieldName} key={index}>{getRespectiveField(field.fieldName)}</option>
                              )}
                          </select>
                      </div>
                  </div>
              </div>
              <div className="row">

                  <div className="col-md-2 ">
                      {
                          this.state.rowFields ? this.state.rowFields.map( row =>
                              <div className="col-md-12 bordered">{getRespectiveField(row)}</div>
                          ) : null
                      }
                      <div className="col-md-12">
                          <select className="form-control" name="rowField" onChange={this.onChange}>
                              <option selected="selected">--Select an option--</option>
                              {this.state.depthArray.map( (field, index) =>
                                  <option value={field.fieldName} key={index}>{getRespectiveField(field.fieldName)}</option>
                              )}
                          </select>
                      </div>
                  </div>

                  <div className="col-md-10 bordered">
                      <table className="table table-bordered med-font-size">
                          {//For the multiple rows in the column field
                              this.state.columnFields.map( (_, index) =>
                                <tbody>
                                        <tr>
                                              {
                                                  //The number of gaps in the column fields
                                                  this.state.rowFields && this.state.rowFields.map((col, colIndex) =>
                                                      <td className="colored-bg"></td>
                                                  )
                                              }
                                              {
                                                  //The multi-layer row-wise viewing of the column fields
                                                  this.state.columnHeaders && this.state.columnHeaders.map((col, colIndex) =>
                                                      <td className="pointer colored-bg">
                                                          {col[index]}
                                                      </td>
                                                  )
                                              }
                                        </tr>
                                    </tbody>
                              )
                          }

                          {
                              this.state.rowHeaders.length === 0 ?
                                  <tbody>
                                      <tr>
                                          {
                                              this.state.pivotArray && this.state.pivotArray.map( col =>
                                                  <td>
                                                      {col}
                                                  </td>
                                              )
                                          }
                                      </tr>
                                  </tbody>
                                  : null
                          }

                          {
                              this.state.rowHeaders && this.state.rowHeaders.map( (row, rowIndex) =>
                                <tbody>
                                      <tr key={rowIndex}>
                                              {
                                                  //For the multiple columns in the row field
                                                  this.state.rowFields.length !== 0 ?
                                                      this.state.rowFields.map((_, index) =>
                                                        <td className="colored-bg">{row[index]}</td>
                                                      ) : null
                                              }
                                              {
                                                  this.state.columnHeaders.length !== 0 ?
                                                      this.state.columnHeaders.map((col, colIndex) =>
                                                          <td>
                                                              {
                                                                  this.state.pivotArray[rowIndex] ?
                                                                      this.state.pivotArray[rowIndex][colIndex]
                                                                      : null
                                                              }
                                                          </td>
                                                      ) :
                                                      this.state.pivotArray &&
                                                        <td>
                                                            {this.state.pivotArray[rowIndex]}
                                                        </td>
                                              }
                                          </tr>
                                  </tbody>
                              )
                          }
                      </table>
                  </div>
              </div>


          </div>
        );
    }
}

export default App;
