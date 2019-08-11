Fragment = require('./lib/fragment');
const argv = require('./config/yargs').argv;

var colors = require('colors');

//Recibo el primer parametro ingresado por el usuario (opcional para el usuario)
let comando = argv._[0];

//Validación si el usuario esta interesado en premaricular
if (comando == 'automata') {
    console.log(`Quieres procesar un automata`.green);

     let binary = new Fragment({
         initial: argv.Estadoinicial
       , accept: argv.EstadoAceptacion
       , transitions: argv.table 
      });

      console.log(binary.test('aabb'));
      
      
    
    let a = argv.EstadoAceptacion;
    console.log(`Estado A: ` );
    console.log(a);
    
    let table = argv.table; 
    console.log(`Tabla :` );
    console.log(table);
    
//node app.js automata -i=1 -a=5 -a=5 -t.1=a -t.1=2 -t.2=a -t.2=3 -t.3=b -t.3=4 -t.4=b -t.4=5 -t.5=b -t.5=5  

}

//En caso de no estar interesado en hacer el proceso de prematricula, se mostrarra la lista de cursos disponibles
else {
    console.log('Debes ingresar: blablabla'.blue);

}

// transitions: {
//     0: ['1',  1]
//   , 1: ['0',  2]
//   , 2: ['1',  3]
//   , 3: ['0',  4]
//   , 4: [] // accept state
//   }