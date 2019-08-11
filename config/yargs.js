const opt = {
    Estadoinicial: {
        demand: true,
        alias: 'i',
        type: Array
    },
    EstadoAceptacion: {
        demand: true,
        alias: 'a'
    },
    table: {
        demand: true,
        alias: 't'
    },
    test: {
        alias: 'p'
    }
};

const argv = require('yargs')
    .command('automata', 'Procesar un automata', opt)
    .command('ayuda', 'Instrucciones de uso de la aplicación')
    .help()
    .argv

module.exports = {
    argv
}