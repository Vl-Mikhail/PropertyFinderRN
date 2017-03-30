/**
 * Отображение результата поиска
 */
import React, { Component } from 'react';
import {
    Image,
    View,
    TouchableHighlight,
    ListView,
    Text,
    NetInfo
} from 'react-native';
import PropertyView from "./PropertyView";
import realm from './components/realm';
import styles from "./components/styles";

export default class SearchResults extends Component {

    constructor (props) {
        super(props);
        let dataSource = new ListView.DataSource(
            {rowHasChanged: (r1, r2) => r1.guid !== r2.guid});
        this.state = {
            dataSource: dataSource.cloneWithRows(this.props.listings),
            isConnected: null
        };
    }

    componentDidMount () {
        NetInfo.isConnected.addEventListener(
            'change',
            this._handleConnectivityChange
        );
        NetInfo.isConnected.fetch().done(
            (isConnected) => {
                this.setState({isConnected});
            }
        );
    }

    componentWillUnmount () {
        NetInfo.isConnected.removeEventListener(
            'change',
            this._handleConnectivityChange
        );
    }

    _handleConnectivityChange = (isConnected) => {
        this.setState({
            isConnected,
        });
    };

    _rowPressed (propertyGuid) {

        let property = this.props.listings[propertyGuid];

        this.props.navigator.push({
            title: "Property",
            component: PropertyView,
            passProps: {property: property}
        });
    }

    renderRow = (rowData, sectionID, rowID) => {
        let price = rowData.price_formatted.split(' ')[0];

        return (
            <TouchableHighlight onPress={() => this._rowPressed(rowID)}
                                underlayColor='#dddddd'>
                <View>
                    <View style={styles.rowContainer}>
                        <Image style={styles.thumb} source={{uri: rowData.img_url}}/>
                        <View style={styles.textContainer}>
                            <Text style={styles.price}>{price}</Text>
                            <Text style={styles.title}
                                  numberOfLines={1}>{rowData.title}</Text>
                        </View>
                    </View>
                    <View style={styles.separator}/>
                </View>
            </TouchableHighlight>
        );
    };

    render () {
        console.log(`Count of Flats in Realm: ${realm.objects('Flats').length}`);
        console.log(`${this.state.isConnected ? 'Online' : 'Offline'}`);

        return (
            <ListView
                dataSource={this.state.dataSource}
                renderRow={this.renderRow}/>
        );
    }
}