/**
 * Метод преобразовывает данные в требуемый формат строки: пары name=value, разделенные амперсандами.
 * @param key
 * @param value
 * @param pageNumber
 * @returns {string} формат строки для URL
 */
import React, { Component } from 'react';
import {
    Text,
    TextInput,
    View,
    TouchableHighlight,
    ActivityIndicator,
    Image,
    NetInfo
} from 'react-native';
import SearchResults from "./SearchResults";
import styles from "./components/styles";
import realm from './components/realm';


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

    onSearchTextChanged = (event) => {
        this.setState({searchString: event.nativeEvent.text});
    };

    /**
     * Получени данный от сервера и парсинг JSON
     * @param query адресс
     * @private
     */
    _executeQuery = (query) => {
        this.setState({isLoading: true});
        if (this.state.isConnected) {
            fetch(query)
                .then(response => response.json())
                .then(json => this._handleResponseNet(json.response))
                .catch(error => {
                    return this.setState({
                        isLoading: false,
                        message: 'Something bad happened ' + error
                    })
                })
        } else {
            this._handleResponseRealm();
        }
    };

    /**
     * Берем данные из Realm
     * @private
     */
    _handleResponseRealm () {
        try {
            this.setState({isLoading: false, message: ''});
            let flatList = realm.objects('City').filtered(`location == "${this.state.searchString}"`)[0].flats;
            this.props.navigator.push({
                title: 'Results',
                component: SearchResults,
                passProps: {listings: flatList},
            });
        } catch (error) {
            return this.setState({
                isLoading: false,
                message: 'Something bad happened ' + error
            })
        }
    }


    /**
     * В случии удачи передам параметры на страницу просмотра
     * @param response ответ
     * @private
     */
    _handleResponseNet (response) {
        this.setState({isLoading: false, message: ''});
        if (response.application_response_code.substr(0, 1) === '1') {
            this._addItem(response);
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
     * Добавить в cache Город и Квартиры
     * @param response
     * @private
     */
    _addItem (response) {
        realm.write(() => {
            realm.delete(realm.objects('City')); // Deletes all city
            realm.delete(realm.objects('Flats')); // Deletes all flats
        });

        // console.log('response', response.locations);
        realm.write(() => {
            realm.create('City', {
                country: 'uk',
                location: response.locations[0].place_name
            });
        });


        let str = response.locations[0].place_name;
        let flatList = realm.objects('City').filtered(`location == "${str}"`)[0].flats;

        realm.write(() => {
            for (let value of response.listings) {
                flatList.push({
                    img_url: value.img_url,
                    price_formatted: value.price_formatted,
                    title: value.title
                });
            }
        });
    };

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
                // let query = urlForQueryAndPage('centre_point', search, 1);
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
