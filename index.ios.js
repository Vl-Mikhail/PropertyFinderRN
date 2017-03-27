/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    NavigatorIOS,
} from 'react-native';
import SearchPage from "./iosApp/SearchPage";

/**
 * Точка входа в приложение
 */
class PropertyFinderRN extends React.Component {
    render () {
        return (
            <NavigatorIOS
                style={styles.container}
                initialRoute={{
                    title: 'Property Finder',
                    component: SearchPage,
                }}/>
        );
    }
}

const styles = StyleSheet.create({
    text: {
        color: 'black',
        backgroundColor: 'white',
        fontSize: 30,
        margin: 80
    },
    container: {
        flex: 1
    },
});

AppRegistry.registerComponent('PropertyFinderRN', () => PropertyFinderRN);
