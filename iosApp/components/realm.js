import Realm from 'realm';

const FlatSchema = {
    name: 'Flats',
    properties: {
        img_url: 'string',
        price_formatted: 'string',
        title: 'string',
    }
};

const CitySchema = {
    name: 'City',
    properties: {
        country: 'string',
        location: 'string',
        flats: {type: 'list', objectType: 'Flats'},
    }
};

export default new Realm({schema: [FlatSchema, CitySchema]});