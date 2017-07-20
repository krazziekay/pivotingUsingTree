import React, { Component } from 'react';
import data from './csvSamples/sample5.json';
import Trie from './utils/trie';
import _find from 'lodash/find';
import _indexOf from 'lodash/indexOf';
import { getRespectiveField , displayOtherNodes, returnLastIndex, getTotal, getPivotString } from './utils/utilFunctions';

let tree = new Trie();
const CODELENGTH = 6;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: data.slice(0, 1000),
            depthArray : [],
            leafNodes: [],
            valueField: 'FIELD7',
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
            case 'valueField' :
                this.setState({
                    valueField: e.target.value
                });
                break;
            default:
                return;
        }
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    convertDataIntoHashKeys = (dataArray) => {
        let depths = [];
        let keysLength = 0;
        dataArray.map( (eachData) =>{
            let mergeFactor = '';
            let leafNodes = {}, depthIndex= 1;
            let hashKey = '';
            Object.keys(eachData).map( (props) => {
                // if(_includes(props, 'id')) {
                if(props === 'FIELD1' || props === 'FIELD3' || props === 'FIELD5') {
                    mergeFactor += this.encodeKeys(eachData[props]);
                    hashKey += this.encodeKeys(eachData[props]);
                    //Adding depths in each node in the tree
                    if( keysLength < Object.keys(eachData).length ) {
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

    encodeKeys = (keys) => {
        let zeroes = '000000';
        return zeroes.substr(0, zeroes.length - keys.length) + keys;
    }

    setRowFields = () => {
        if(this.state.rowPivotField.length === 0) {
            let leafNodes = [];
            let searchDepthValue = _find(this.state.depthArray, {fieldName: this.state.rowFields[0]});
            let rowData = tree.traverse(searchDepthValue.depth);
            rowData.map( (eachNode, eachNodeIndex) => {
                leafNodes[eachNodeIndex] = tree.getLeafNodes(eachNode);
            });
            let resultArray = this.getHeaders(this.state.rowFields, leafNodes);
            this.setState({
                rowPivotField: leafNodes,
                rowHeaders : resultArray
            });
        }
        else{
            let resultArray = this.getHeaders(this.state.rowFields, this.state.rowPivotField);
            this.setState({
                rowHeaders: resultArray
            }, () => console.log(this.state.columnHeaders, this.state.rowHeaders));
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
                    leafNodes[eachNodeIndex] = tree.getLeafNodes(eachNode);
                });
            });
            let resultArray = this.getHeaders(this.state.columnFields, leafNodes);
            this.setState({
                columnPivotField: leafNodes,
                columnHeaders : resultArray
            });
        }
        else {
            let resultArray = this.getHeaders(this.state.columnFields, this.state.columnPivotField);
            this.setState({
                columnHeaders: resultArray
            }, () => console.log(this.state.columnHeaders, this.state.rowHeaders));
        }
    }

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

    getResults = (row, col) => {
        // console.log("Find the data for this row and col ", row, col);
    }

    getLeafNodes = () => {
        let leafNodes = tree.getLeafNodes();
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
                      <select className="form-control" name="valueField" onChange={this.onChange}>
                          <option value="FIELD7" >FIELD7</option>
                          <option value="FIELD8" >FIELD8</option>
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
                          <tbody>
                          {//For the multiple rows in the column field
                              this.state.columnFields.map((_, index) =>
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
                              )
                          }

                          {
                              this.state.rowHeaders && this.state.rowHeaders.map((row, rowIndex) =>
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
                                                          {this.getResults(row, col)}
                                                          {/*n/a*/}
                                                      </td>
                                                  ) :
                                                  <td>
                                                      {/*n/a*/}
                                                      {this.getResults(row)}
                                                  </td>
                                          }

                                      </tr>
                                  )
                          }
                          </tbody>
                      </table>
                  </div>
              </div>


          </div>
        );
    }
}

export default App;
