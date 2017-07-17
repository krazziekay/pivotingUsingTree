/**
 * Created by rosia on 7/17/17.
 */
import React, { Component } from 'react';
import { getRespectiveField , displayOtherNodes , getTotal } from './utils/utilFunctions';


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
                        <th>{this.state.valueField}</th>
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
                                    {getTotal(this.props.pivotArray[firstRow])}
                                </td>
                            </tr>
                            {
                                this.state[`${firstRow}_${firstIndex}`] ?
                                    <tr className="gap">
                                        {
                                            Object.keys(this.props.pivotArray[firstRow]).map( (secondRow, secondIndex) =>
                                                <div>
                                                    <div>
                                                        --> {this.props.pivotArray[firstRow][secondRow][ getRespectiveField(this.props.nextIndex[2]) ]} : {this.props.pivotArray[firstRow][secondRow][this.props.valueField]}
                                                    </div>
                                                </div>
                                            )
                                        }
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