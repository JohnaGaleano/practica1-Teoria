Fragment = require('./lib/fragment');
const argv = require('./config/yargs').argv;
var colors = require('colors');

//Recibo el primer parametro ingresado por el usuario (opcional para el usuario)
let comando = argv._[0];

//Validación si el usuario esta interesado en procesar un automatas
if (comando == 'automata') {
    console.log(`Quieres procesar un automata`.green);

    let binary = new Fragment({
        initial: argv.Estadoinicial
        , accept: argv.EstadoAceptacion
        , transitions: argv.table
    });

    if (argv.test) {
        console.log('Prueba con la hilera ' + argv.test);
        if (binary.test(argv.test)){
            console.log('La hilera es valida'.green); 
        } else{console.log('La hilera no es valida'.red);
        }
    }

    console.log(`Minimizacion: `);
    console.log(binary.minimize());

    for (const key in argv.table) {
        if (argv.table[key][0] == '*0') {
            console.log('Si hay *0');
        }
        else {
            console.log('Es AFD');
        }
        // console.log( argv.table[key][0]);
    }





    let a = argv.EstadoAceptacion;
    // console.log(`Estado A: `);
    // console.log(a);

    let table = argv.table;
    // console.log(`Tabla :`);
    // console.log(table);

    // node app.js automata -i=1 -a=5 -a=5 -t.1=a -t.1=2 -t.2=a -t.2=3 -t.3=b -t.3=4 -t.4=b -t.4=5 -t.5=b -t.5=5  
    // node app.js automata -i=1 -a=5 -a=5 -t.1=a -t.1=2 -t.2=a -t.2=3 -t.3=b -t.3=4 -t.4=b -t.4=5 -t.5=b -t.5=5 -t.6='*0' -t.6=2 

}
//En caso de no saber que hacer
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