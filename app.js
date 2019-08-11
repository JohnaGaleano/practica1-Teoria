Fragment = require('./lib/fragment')
const argv = require('./config/yargs').argv

var colors = require('colors')

//Recibo el primer parametro ingresado por el usuario (opcional para el usuario)
let comando = argv._[0]

//Validación si el usuario esta interesado en premaricular
if (comando == 'automata') {
    console.log(`Quieres procesar un automata`.green);
    // let binary = new Fragment({
    //     initial: argv.Estadoinicial
    //   , accept: argv.EstadoAceptacion
    //   , transitions: argv.table 
    //   });
    let a = argv.EstadoAceptacion
    console.log(`Estado A: ` );
    console.log(a);
    
    let table = argv.table 
    console.log(`Tabla :` );
    console.log(table);
    
    

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