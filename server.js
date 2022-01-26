import express from 'express';
import cors from 'cors';
import knex from 'knex';
import multer from 'multer';
import path from 'path';


const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null , "./");},
	filename: function(req, file, cb){
		const ext = file.mimetype.split("/")[1];
		cb(null, `uploads/${file.originalname}-${Date.now()}.${ext}`);
	}
})
const upload = multer({
	storage: storage
});
const db = knex({
	client: 'pg',
	connection: {
	  host : '127.0.0.1',
	  port : 5432,
	  user : 'deepanshu',
	  password : '1234',
	  database : 'resume_builder'
	}
      });

 db.select('*').from('login').then(data => {
	 console.log(data);
 }) ;

const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());
app.options('*',cors());

const database = {
	users:[
		{
			id: '123',
			name: 'John',
			password: 'cookies',
			email: 'john@gmail.com',
			areaOfInterest: 'data structures',
			skills: [ ['C' , 4 ] , [ 'C++' , 4 ] , [ 'Java' , 5]],
			education: 'Some school',
			achievements: [ '1st place' , '38 in long challenge'],
		},
		{
			id: '124',
			name: 'Sally',
			password: 'apples',
			email: 'sally@gmail.com',
			areaOfInterest: 'Algorithms',
			skills: [ ['C' , 4 ] , [ 'Python' , 4 ] , [ 'Javascript' , 5]],
			education: 'Another school',
			achievements: [ '2nd place' , '100 in long challenge'] ,
		}
	],
	info_table: [
		{
			id: '123',
			filename: 'John Software Developer',
			templateNo: '2'
		}
	]
}

app.get('/', (req, res) => {
	res.send(database.users);
})

app.post('/signin', (req, res) => {
	if( req.body.email === database.users[0].email &&
		req.body.password === database.users[0].password ) {
			res.json('success') ;
		}
	else {
		res.status(400).json('error logging in') ;
	}
})

app.post('/register' , (req, res) => {
	const { email, name, password } = req.body ;
	// database.users.push({
	// 	id: '125',
	// 	name: name,
	// 	email: email,
	// 	password: password,
	// 	areaOfInterest: '',
	// 	skills: [ ],
	// 	education: '',
	// 	achievements: [ ] ,
	console.log('adding resume');
	console.log(this.state.resume);
	console.log('props is now:');
	console.log(this.props.resume);
	// })
	db('login')
	.returning('*')
	.insert({
		hash: password,
		email: email
	})
	.then(user => {
		res.json(user[0]);
	})
	.catch(err => res.status(400).json('unable to register')) ;
})

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	let found = false ;
	database.users.forEach(user => {
		if(user.id === id) 
		{
			found = true ;
			return res.json(user);
		}
		
	})

	if(!found) {
		res.status(400).json('not found') ;
	}
})

app.post('/addResume', (req,res) => {
	const { id ,filename, areaofinterest,skills,education,achievements, templateno } = req.body.input ;

	console.log('request received is:\n');
	console.log(req.body.input);

	db('resumes')
	.returning('*')
	.insert({
		id: id,
		filename: filename,
		areaofinterest: areaofinterest,
		skills: skills,
		achievements: achievements,
		education: education,
		templateno: templateno,
		// photo: null
	})
	.then(resume => res.json(resume[0]))
	.catch(err => res.status(400).json(err));

//  db.select('*').from('resumes').then(data => {
// 	 console.log(data);
//  }).then(res => res.json('successful'))
//  .catch(err => res.json(err)) ;
	// const output= "Output from server";
	// return res.json(output);

	
})

app.post('/addPic' , upload.single('image'), (req, res , err) => {
	if(!req.file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)){
		res.send({ msg: 'Only image files (jpg, jpeg, png) are allowed!'})
	}
	else {
		const image = req.file.filename;
		const id = 4;
		knex('resumes')
		.where('id', '=', id)
		.update({
		photo: image
		})
	}
})

app.get('/showAll/:id', (req, res) => {
	const {id} = req.params;
	const userdata = [];

	// database.info_table.forEach( resume => {
	// 	if(resume.id === id){
	// 		userdata.push(resume);
	// 	}
	// })
	db('resumes')
	.returning('*')
	.select('*')
	.where('id','=',id)
	.then(resumeList =>{
		res.json(resumeList);
	})
	.catch(err => res.status(400).json(err));

	// return res.json(userdata);


})

app.get('/edit' , (req, res) => {
	const {id, filename } = req.body;

	let found = false ;
	database.info_table.forEach( resume => {
		if(resume.id === id && 
		   resume.filename === filename ){
			found = true;
			return res.json(resume);
		}
	})

	
	if(!found)
		res.status(400).json('Document does not exist');

})

app.listen(3000, () => {
	console.log('app is running on port 3000');
})