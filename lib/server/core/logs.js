//require('dotenv').config();
// const {
// 	MongoClient
// } = require('mongodb');

const write = async function (message) {
	// const mongodb_connection = process.env.MONGO_CONNECTION;
	// const client = await MongoClient.connect(mongodb_connection);
	// try {
	// 	const db = client.db('cgmsim');
	// 	const logs = await db.collection('logs');
	// 	await logs.insert({
	// 		message,
	// 		date:new Date()
	// 	});
	// } catch (error) {
	// 	console.log(error);
	// } finally {
	// 	client.close();
	// }

};
const get = async function () {
	// const mongodb_connection = process.env.MONGO_CONNECTION;
	// const client = await MongoClient.connect(mongodb_connection);
	// try {
	// 	const db = client.db('cgmsim');
	// 	const logs = await db.collection('logs');
	// 	return await logs.find().sort({date:-1}).limit(50).toArray();
	// } catch (error) {
	// 	console.log(error);
	// } finally {
	// 	client.close();
	// }

};
module.exports = {
	write,
	get
};