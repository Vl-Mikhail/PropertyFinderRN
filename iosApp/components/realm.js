import Realm from 'realm';

let FlatSchema = {
    name: 'Flats',
    properties: {
        img_url: 'string',
        price_formatted: 'string',
        title: 'string',
    }
};

export default new Realm({schema: [FlatSchema]});