import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableHighlight,
    ActivityIndicator,
    Image,
    NetInfo
} from 'react-native';
import SearchResults from "./SearchResults";

/**
 * Метод преобразовывает данные в требуемый формат строки: пары name=value, разделенные амперсандами.
 * @param key
 * @param value
 * @param pageNumber
 * @returns {string} формат строки для URL
 */
function urlForQueryAndPage (key, value, pageNumber) {
    const data = {
        country: 'uk',
        pretty: '1',
        encoding: 'json',
        listing_type: 'buy',
        action: 'search_listings',
        page: pageNumber
    };

    data[key] = value;

    const querystring = Object.keys(data)
        .map(key => key + '=' + encodeURIComponent(data[key]))
        .join('&');

    return 'https://api.nestoria.co.uk/api?' + querystring;
}

/**
 * Главная страница
 */
export default class SearchPage extends Component {

    constructor (props) {
        super(props);
        this.state = {
            searchString: 'london',
            isLoading: false,
            message: '',
            isConnected: null
        };
    }

    componentDidMount() {
        NetInfo.isConnected.addEventListener(
            'change',
            this._handleConnectivityChange
        );
        NetInfo.isConnected.fetch().done(
            (isConnected) => { this.setState({isConnected}); }
        );
    }

    componentWillUnmount() {
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

    onSearchTextChanged = (event) => {
        this.setState({searchString: event.nativeEvent.text});
    };

    /**
     * Получени данный от сервера и парсинг JSON
     * @param query адресс
     * @private
     */
    _executeQuery = (query) => {
        console.log(query);
        this.setState({isLoading: true});
        fetch(query)
            .then(response => response.json())
            .then(json => this._handleResponse(json.response))
            .catch(error =>
                this.setState({
                    isLoading: false,
                    message: 'Something bad happened ' + error
                }));
    };

    /**
     * В случии удачи передам параметры на страницу просмотра
     * @param response ответ
     * @private
     */
    _handleResponse (response) {
        this.setState({isLoading: false, message: ''});
        if (response.application_response_code.substr(0, 1) === '1') {
            this.props.navigator.push({
                title: 'Results',
                component: SearchResults,
                passProps: {listings: response.listings},
            });
        } else {
            this.setState({message: 'Location not recognized; please try again.'});
        }
    }

    /**
     * Получаем данные с формы
     */
    onSearchPressed = () => {
        let query = urlForQueryAndPage('place_name', this.state.searchString, 1);
        this._executeQuery(query);
    };

    /**
     * Метод определения место положения.
     * @centre_point - локация (51.323, -1.234)
     */
    onLocationPressed = () => {
        navigator.geolocation.getCurrentPosition(
            location => {
                // let search = location.coords.latitude + ',' + location.coords.longitude;
                let search = "London";
                this.setState({searchString: search});
                // let query = urlForQueryAndPage('centre_point', this.state.searchString, 1);
                let query = urlForQueryAndPage('place_name', this.state.searchString, 1);
                this._executeQuery(query);
            },
            error => {
                this.setState({
                    message: 'There was a problem with obtaining your location: ' + error
                });
            });
    };

    render () {

        const spinner = this.state.isLoading ?
            ( <ActivityIndicator
                size='large'/> ) :
            ( <View/>);

        return (
            <View style={styles.container}>
                <Text style={styles.description}>
                    Search for houses to buy!
                </Text>
                <Text style={styles.description}>
                    Search by place-name, postcode or search near your location.
                </Text>
                <View style={styles.flowRight}>
                    <TextInput
                        style={styles.searchInput}
                        value={this.state.searchString}
                        onChange={this.onSearchTextChanged}
                        placeholder='Search via name or postcode'/>
                    <TouchableHighlight style={styles.button}
                                        onPress={this.onSearchPressed}
                                        underlayColor='#99d9f4'>
                        <Text style={styles.buttonText}>Go</Text>
                    </TouchableHighlight>
                </View>
                <View style={styles.flowRight}>
                    <TouchableHighlight style={styles.button}
                                        onPress={this.onLocationPressed}
                                        underlayColor='#99d9f4'>
                        <Text style={styles.buttonText}>Location</Text>
                    </TouchableHighlight>
                </View>
                <Image source={require('./../Resources/house.png')} style={styles.image}/>
                {spinner}
                <Text style={styles.description}>{this.state.message}</Text>
                <View>
                    <Text>{this.state.isConnected ? 'Online' : 'Offline'}</Text>
                </View>
            </View>

        );
    }
}


const styles = StyleSheet.create({
    description: {
        marginBottom: 20,
        fontSize: 18,
        textAlign: 'center',
        color: '#656565'
    },
    container: {
        padding: 30,
        marginTop: 65,
        alignItems: 'center'
    },
    flowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch'
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
        alignSelf: 'center'
    },
    button: {
        height: 36,
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#48BBEC',
        borderColor: '#48BBEC',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 10,
        alignSelf: 'stretch',
        justifyContent: 'center'
    },
    searchInput: {
        height: 36,
        padding: 4,
        marginRight: 5,
        flex: 4,
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#48BBEC',
        borderRadius: 8,
        color: '#48BBEC'
    },
    image: {
        width: 217,
        height: 208
    }
});