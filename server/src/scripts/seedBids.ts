import mongoose from 'mongoose';
import { Bid } from '../models/Bid.js';
import { Work } from '../models/Work.js';

await mongoose.connect('mongodb://localhost:27017/tender');
await mongoose.connection.db.dropCollection('bids');

const works = await Work.find();
const bidderData = [
  'Arun Electricals','Ashapura Electric','Bhawani air systems','Bitu Prabhat Electrical','Bright Home',
  'Friends Enterprises','GANPATI COMMUNICATION SERVICES','Ganpati Engineering and Electricals','Global Projects',
  'GM AUTOMATION AND SOLUTION','Goyal Electricals','H M Engineers','Kataria Electricals','KHATRI ELECTRIC SERVICE',
  'MANDORE FIRE SAFETY CENTRE','Mechanical Services','Metro International','Mitul Enterprises',
  'Nakoda Construction and Electricals','Neha Electric','Omega Elevators','ORBIS ELEVATOR CO LTD',
  'PARAG ELECTRICALS','Paras Engineering works','Power Solution','Powertech Engineers','Prince Electricals udaipur',
  'R S Enterprises','Riddhi siddhi Enterprises','Sarvoday Electromart','Sarvoday Energy Enterprises Banswara',
  'Satguru Electricals','Seema Electricals','Shree Balaji Electricals.','SHREEJI ENTERPRISES UDAIPUR',
  'Shri Balaji Electrical','Taniya Electricals','Techno Industries Pvt Ltd','Techno Solutions','Uma Ram and Sons',
  'Vikas Enterprises','Vimal Electricals','VK Enterprises','Yash Electricals'
];
const addresses = [
  'fatehpuria Bazar, Pali','UDAIPUR','Jaipur','Jaipur','Udaipur','452 Moksh Marg Shastri Circle Udaipur',
  '192, Surya Nagar, Gopalpura Bypass, Jaipur','Jaipur','Jaipur','Jaipur','50/430 Surya Marg, Mansarovar, Jaipur',
  'Jaipur','29 B, Shakti Nagar, Udaipur','Ratan Singh Bazar, Barmer','Jodhpur','A 72, Vijay Nagar, Kartarpura, Jaipur',
  'Jaipur','1/1839 Neemuch Mata Scheme, Dewali, Udaipur','Udaipur','Pali','A-4 JAIM APARTMENT, DADA SAHEB PAGLA K PAAS, NAVRANGPURA, AHMEDABAD -380009',
  'Ahmedabad','12, Gujar ki Thadi, Banshi Bihar, Gopalpura Bye Pass, Jaipur - 302019','Sagwara, Dungarpur','UDAIPUR','Rajsamand',
  'Udaipur','Plot No 10, Infront of Govt Girls College No 4, Gandhinagar, Chittorgarh - 312001','Chittorgarh','Kherwara, Udaipur',
  'Banswara','Rajsamand','Near Radha Vallabh Temple, Bhaylapura, Ward 19, Hindon City, Distt- Karauli, 322230',
  'O-7 Anand Vihar, Sri Ganganagar 335001 Raj.','UDAIPUR','123, Central Area near Police Line, Udaipur','Dausa',
  'Ahmedabad','Jaipur','Jodhpur','MIA Road No 4, Udaipur','UDAIPUR','Udaipur','Udaipur'
];

const bids = bidderData.map((name, idx) => ({
  workId: works[idx % 10]._id,
  bidderName: name,
  address: addresses[idx],
  amount: works[idx % 10].gScheduleAmount,
  percentile: null,
}));
await mongoose.connection.collection('bids').insertMany(bids);
console.log('Inserted 44 bids');
await mongoose.disconnect();