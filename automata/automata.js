var Automata
  , StateMachine = require('./machine')
  , _minimize = require('./minimize')
  , string2dfa = require('./string2dfa')
  , nfa2dfa = require('./nfa2dfa');


Automata = function Automata(def, acceptName) {

  // No importa si es String o int, funciona para la construcción del autómata
  if (typeof def == 'string') {
    def = string2dfa(def, acceptName);
  }
  // En caso futuro de ficheros, el caracter designado para el final de lectura es (-1)
  else if (def === -1) {
    def = {
      initial: 0
      , accept: [1]
      , transitions: {
        0: [-1, 1]
        , 1: []
      }
    };
  }

  var err = this.validate(def);

  if (err !== true) {
    throw err;
  }

  this.initial = def.initial;
  this.accept = def.accept;
  this.transitions = def.transitions;

};

Automata.prototype.copy = function copy() {
  return {
    initial: this.initial
    , accept: JSON.parse(JSON.stringify(this.accept))
    , transitions: JSON.parse(JSON.stringify(this.transitions))
  };
};

Automata.prototype.toDfa = function toDfa(delimiter) {
  return nfa2dfa(this.copy(), delimiter);
};

Automata.prototype.minimize = function minimize(delimiter) {
  return _minimize(this.toDfa(delimiter));
};

Automata.prototype.validate = function validate(def) {

  var i, ii, k;

  if (!def) {
    return new Error('Automata needs a definition');
  }

  if (def.initial == null) {
    return new Error('Automata needs an initial state');
  }

  if (!Array.isArray(def.accept)) {
    return new Error('Automata must have an array of accepted states');
  }

  if (def.transitions == null) {
    return new Error('Automata must have a map of transitions');
  }

  // Se valida si el estado de aceptación existe en el mapa de transiciones
  for (i = 0, ii = def.accept.length; i < ii; ++i) {
    if (def.transitions[def.accept[i]] == null) {
      return new Error('Accept state "' + def.accept[i] +
        '" does not exist in the transition map');
    }
  }

  // Se valida si los estados a hacer transición existen en el mapa de transiciones
  for (k in def.transitions) {
    if (!Array.isArray(def.transitions[k])) {
      return new Error('The transitions for ' + k + ' must be an array');
    }

    for (i = 1, ii = def.transitions[k].length; i < ii; i += 2) {
      if (def.transitions[def.transitions[k][i]] == null) {
        return new Error('Transitioned to ' + def.transitions[k][i] +
          ', which does not exist in the transition map');
      }
    }
  }

  return true;

};

/**
* Apartado de testing *
*/
Automata.prototype.test = function test(input) {
  return new StateMachine(this.minimize()).accepts(input);
};

Automata.prototype.concat = function concat(other) {
  other = new Automata(other.copy());

  other._resolveCollisions(this);

  var bInitial = other.initial;

  // apunta los estados finales de a hacia los iniciales de b
  for (var i = 0, ii = this.accept.length; i < ii; ++i) {
    this.transitions[this.accept[i]].push('\0', bInitial);
  }

  // Añade todas las transiciones de b hacia a
  for (var k in other.transitions) {
    this.transitions[k] = other.transitions[k];
  }

  this.accept = other.accept;

  return this;
};

Automata.prototype.union = function union(other) {
  other = new Automata(other.copy())

  // When joining a to b, b should disambiguate itself from a
  other._resolveCollisions(this)

  // Create a new initial state
  var original = 'union'
    , suffix = '`'
    , newStateKey = original + suffix
    , oldInitial = this.initial

  // Watch for collisions in both sides!
  while (this._hasState(newStateKey)) {
    suffix = suffix + '`';
    newStateKey = original + suffix;
  }

  this.initial = newStateKey;

  // Point new state to the other two initial states with epsilon transitions
  this.transitions[this.initial] = ['\0', oldInitial, '\0', other.initial];

  // Add all transitions from b to a
  for (var k in other.transitions) {
    this.transitions[k] = other.transitions[k];
  }

  this.accept.push.apply(this.accept, other.accept);

  return this;
};

/**
* Check out: https://cloudup.com/c64GMr1lTFj
* Source: http://courses.engr.illinois.edu/cs373/sp2009/lectures/lect_06.pdf
*/
Automata.prototype.repeat = function repeat() {

  // Create a new initial state
  var original = 'repeat'
    , suffix = '`'
    , newStateKey = original


  suffix = '`'

  newStateKey = original + suffix

  while (this._hasState(newStateKey)) {
    suffix = suffix + '`'
    newStateKey = original + suffix
  }

  // Point the final states to the initial state of b
  for (var i = 0, ii = this.accept.length; i < ii; ++i) {
    this.transitions[this.accept[i]].push('\0', this.initial)
  }

  this.transitions[newStateKey] = ['\0', this.initial]

  this.initial = newStateKey
  this.accept.push(newStateKey)

  return this
}

Automata.prototype.states = function states() {
  return Object.keys(this.transitions)
}

/**
* Resolves collisions with `other` by renaming `this`'s states
*/
Automata.prototype._resolveCollisions = function _resolveCollisions(other) {
  var states = other.states()
    , needle
    , original
    , suffix;

  for (var i = 0, ii = states.length; i < ii; ++i) {
    needle = states[i];

    if (!this._hasState(needle)) {
      continue;
    }

    original = needle;
    suffix = '`';

    needle = original + suffix;

    while (this._hasState(needle)) {
      suffix = suffix + '`';
      needle = original + suffix;
    }

    this._renameState(original, needle);
  }

  return true;
};

Automata.prototype._hasState = function _hasState(needle) {
  return this.transitions[needle] != null;
};

/**
* Renames the state `from` to `to`
*/
Automata.prototype._renameState = function _renameState(from, to) {
  var t = this.transitions[from]
    , i = 0
    , ii = 0

  if (t == null) {
    throw new Error('The state ' + from + ' does not exist')
  }

  if (this.initial == from) {
    this.initial = to
  }

  delete this.transitions[from]
  this.transitions[to] = t

  for (var k in this.transitions) {
    for (i = 1, ii = this.transitions[k].length; i < ii; i += 2) {
      if (this.transitions[k][i] == from) {
        this.transitions[k][i] = to
      }
    }
  }

  for (i = 0, ii = this.accept.length; i < ii; ++i) {
    if (this.accept[i] == from) {
      this.accept[i] = to
    }
  }
}

module.exports = Automata
