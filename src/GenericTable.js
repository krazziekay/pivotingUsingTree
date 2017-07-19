/**
 * Created by rosia on 7/17/17.
 */
import React, { Component } from 'react';
import { getRespectiveField, displayOtherNodes , getTotal } from './utils/utilFunctions';


class GenericTable extends Component {
    constructor(){
        super();
        this.state = {};
    }

    componentDidMount() {
    }


    setDisplay = (relatedField, indexName, selectedIndex) => {
        let results = displayOtherNodes(relatedField, selectedIndex);
        this.setState({
            [indexName]: !this.state[indexName],
            [`${indexName}_data`]: results
        });
    }

    render() {
        return (
            <table className="gap table table-striped">
                <thead>
                    <tr>
                        <th>{getRespectiveField(this.props.nextIndex[1])}</th>
                        <th>{this.props.valueField}</th>
                    </tr>
                </thead>
                {
                    Object.keys(this.props.pivotArray).map( (firstRow, firstIndex) =>
                        <tbody>
                            <tr onClick={() => this.setDisplay(this.props.pivotArray[firstRow], `${firstRow}_${firstIndex}`, this.props.nextIndex[1])}>
                                <td>
                                    {firstRow}
                                </td>
                                <td>
                                    {getTotal(this.props.pivotArray[firstRow], this.props.valueField)}
                                </td>
                            </tr>
                            {
                                this.state[`${firstRow}_${firstIndex}`] ?
                                    <tr className="gap"> 
                                        <table className="gap table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>{getRespectiveField(this.props.nextIndex[2])}</th>
                                                    <th>{this.props.valueField}</th>
                                                </tr>
                                            </thead>
                                            {
                                                Object.keys(this.props.pivotArray[firstRow]).map( (secondRow, secondIndex) =>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                {this.props.pivotArray[firstRow][secondRow][ getRespectiveField(this.props.nextIndex[2]) ]}
                                                            </td>
                                                            <td>
                                                                {this.props.pivotArray[firstRow][secondRow][this.props.valueField]}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                )
                                            }
                                        </table>
                                    </tr> : null
                            }
                        </tbody>
                    )
                }
            </table>
        );

    }
}

export default GenericTable;