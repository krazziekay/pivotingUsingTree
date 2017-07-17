import React, { Component } from 'react';
import data from './csvSamples/sample5.json';
import Trie from './utils/trie';
import _find from 'lodash/find';
import _indexOf from 'lodash/indexOf';
import GenericTable from './GenericTable';
import { getRespectiveField , displayOtherNodes, returnLastIndex, getTotal } from './utils/utilFunctions';

let tree = new Trie()
const CODELENGTH = 6;

class App extends Component {
    constructor() {
        super();
        this.state = {
            data: data,
            depthArray : [],
            leafNodes: [],
            pivotArray: [],
            valueField: 'FIELD8',
            rowFields: [],
            columnFields: []
        };
    }

    componentDidMount() {
        let startTime = performance.now(), endTime = 0;
        let convertedHashKeys = this.convertDataIntoHashKeys(this.state.data);
        this.setState({
            data: [],
            tree : convertedHashKeys.tree,
            depthArray: convertedHashKeys.depth
        }, () => {
            endTime = performance.now();
            console.log("Tree making time", endTime - startTime + 'ms' );
            console.log("Tree :: ", this.state);
            this.getLeafNodes();
        });
    }

    onChange = (e) => {
        switch(e.target.name) {
            case 'rowField' :
                if (_indexOf(this.state.rowFields, e.target.value) === -1) {
                    this.setState({
                        rowFields: [].concat(this.state.rowFields).concat(e.target.value)
                    }, () => this.pivotTree());
                }
                break;
            case 'columnField' :
                if(_indexOf(this.state.columnFields, e.target.value) === -1) {
                    this.setState({
                        columnFields: [].concat(this.state.columnFields).concat(e.target.value)
                    });
                }

                // }, () => this.pivotTree() );
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
                if(props === 'FIELD1' || props === 'FIELD3' || props === 'FIELD5' || props === 'FIELD7') {
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

    pivotTree = ()=> {
        if(this.state.pivotArray.length > 1) {
            return;
        }
        let searchDepthValue = _find(this.state.depthArray, {fieldName: returnLastIndex(this.state.rowFields)});
        let nodes = tree.traverse(searchDepthValue.depth);

        let groupByLeafNodes = [];
        nodes.map( (eachNode, index) => {
            groupByLeafNodes[index] = {
                value: tree.getLeafNodes(eachNode),
                nodeName: tree.getLeafNodes(eachNode)[0][getRespectiveField(returnLastIndex(this.state.rowFields))]
            };
        });
        this.setState({
            pivotArray: groupByLeafNodes
        });
    }

    getLeafNodes = () => {
        let leafNodes = tree.getLeafNodes();
        this.setState({
            leafNodes: leafNodes
        });
    }

    setDisplay = (relatedField, indexName, selectedIndex) => {
        let results = displayOtherNodes(relatedField, selectedIndex);
        this.setState({
            [indexName]: !this.state[indexName],
            [`${indexName}_data`]: results
        });
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    render() {
        return (
          <div className="App">
              <div className="row bordered">
                  <div className="col-md-2">
                      <select className="form-control" name="valueField" onChange={this.onChange}>
                          <option selected="selected" disabled="disabled">FIELD8</option>
                          {this.state.depthArray.map( (field, index) =>
                              <option value={getRespectiveField(field.fieldName)} key={index}>{getRespectiveField(field.fieldName)}</option>
                          )}
                      </select>
                  </div>
                  <div className="col-md-10 row">
                      {
                          this.state.columnFields ? this.state.columnFields.map( col =>
                              <div className="col-md-2 bordered">{col}</div>
                          ) : null
                      }
                      <div className="col-md-3">
                          <select className="form-control" name="columnField" onChange={this.onChange}>
                              <option selected="selected">--Select an option--</option>
                              {this.state.depthArray.map( (field, index) =>
                                  <option value={field.fieldName} key={index}>{field.fieldName}</option>
                              )}
                          </select>
                      </div>
                  </div>
              </div>
              <div className="row">

                  <div className="col-md-2 ">
                      {
                          this.state.rowFields ? this.state.rowFields.map( row =>
                              <div className="col-md-12 bordered">{row}</div>
                          ) : null
                      }
                      <div className="col-md-12">
                          <select className="form-control" name="rowField" onChange={this.onChange}>
                              <option selected="selected">--Select an option--</option>
                              {this.state.depthArray.map( (field, index) =>
                                  <option value={field.fieldName} key={index}>{field.fieldName}</option>
                              )}
                          </select>
                      </div>
                  </div>

                  <div className="col-md-10 bordered">
                      {
                          this.state.pivotArray.length ?
                              <table className="table table-bordered">
                                  <thead>
                                    <tr>
                                        <th>{getRespectiveField(this.state.rowFields[0])}</th>
                                        <th>{this.state.valueField}</th>
                                    </tr>
                                  </thead>
                                  {
                                      this.state.pivotArray.map( (row, rowIndex) =>
                                          <tbody key={rowIndex}>
                                              <tr>
                                                  <td onClick={() => this.setDisplay(row.value, `${row.nodeName}_${rowIndex}`, this.state.rowFields[1])}>{row.nodeName}</td>
                                                  <td>
                                                      <div>
                                                          {getTotal(row.value, this.state.valueField)}
                                                      </div>
                                                  </td>

                                              </tr>
                                              {
                                                  this.state[`${row.nodeName}_${rowIndex}`] ?
                                                      <GenericTable pivotArray={this.state[`${row.nodeName}_${rowIndex}_data`]} nextIndex={this.state.rowFields} valueField={this.state.valueField} />
                                                      : null
                                              }
                                          </tbody>

                                      )
                                  }
                              </table>
                              : null
                      }
                  </div>
              </div>


          </div>
        );
    }
}

export default App;
