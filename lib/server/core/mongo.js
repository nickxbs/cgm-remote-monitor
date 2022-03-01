//require('dotenv').config();
const {MongoClient} = require('mongodb');

module.exports = async function(env){
	const mongodb_connection = env.CUSTOMCONNSTR_mongo_cgmsim;
	const client = await MongoClient.connect(mongodb_connection);
	return {
		db:client.db('cgmsim'),
		client
	};
};