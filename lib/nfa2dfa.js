function nfa2dfa (frag, delimiter) {

  if(delimiter == null) {
    delimiter = String.fromCharCode(3193)
  }

  // si el delimitador está en alguno de los estados, falla
  for(var k in frag.transitions) {
    if(k.indexOf(delimiter) > -1) {
      return new Error('Delimiter "' + delimiter + '" collision in state "' + k + '"')
    }
  }

  /**
  * Devuelve el cierre del estado.
  * Esto significa que se puede acceder a todos los estados mediante transiciones epsilon
  *
  * El estado es singular pero en realidad es un conjunto de estados.
  * porque la construcción del subconjunto crea estados
  * que son la unión de otros estados
  */
  function closureOf (state) {
    var i = 0
      , ii = 0
      , j = 0
      , jj = 0
      , trans
      , closure = [].concat(state)
      , discoveredStates

    while(true) {
      discoveredStates = []

      for(i=0, ii=closure.length; i<ii; ++i) {
        trans = frag.transitions[closure[i]]
        for(j=0, jj=trans.length; j<jj; j += 2) {
          // Empareja las transiciones epsilon 
          if(trans[j] == '*0') {
            // Empuje el estado de destino a la salida
            if(closure.indexOf(trans[j + 1]) < 0) {
              discoveredStates.push(trans[j + 1])
            }
          }
        }
      }

      if(discoveredStates.length === 0) {
        break
      }
      else {
        closure.push.apply(closure, discoveredStates)
      }

      discoveredStates = []
    }

    // Esto permite hacer una comparación profunda de microestados rápidamente
    return closure.sort()
  }

  /**
  * El estado es singular pero en realidad es una serie de estados
  * porque la construcción del subconjunto crea estados
  * que son la unión de otros estados
  */
  function goesTo (state, chr) {
    var output = []
      , i = 0
      , ii = state.length
      , j = 0
      , jj = 0
      , trans
      , dest

    for(; i<ii; ++i) {
      trans = frag.transitions[state[i]]

      for(j=0, jj=trans.length; j<jj; j += 2) {
        if(trans[j] == chr) {
          dest = trans[j + 1]
          // Empuje el estado de destino a la salida si es nuevo
          if(output.indexOf(dest) < 0) {
            output.push(dest)
          }
        }
      }
    }

    return closureOf(output)
  }

  /**
  * Devuelve los caracteres que permiten
  * una transición fuera del estado
  */
  function exits (state) {
    var chars = []
      , i = 0
      , ii = state.length
      , j = 0
      , jj = 0
      , trans

    for(; i<ii; ++i) {
      trans = frag.transitions[state[i]]

      for(j=0, jj=trans.length; j<jj; j += 2) {
        if(trans[j] != '*0' && chars.indexOf(trans[j]) < 0) {
          chars.push(trans[j])
        }
      }
    }

    return chars
  }

  // Inicie el algoritmo calculando el cierre del estado 0
  var processStack = [closureOf([frag.initial])]
    , initialStateKey = processStack[0].join(delimiter)
    , current = []
    , exitChars = []
    , i = 0
    , ii = 0
    , j = 0
    , jj = 0
    , replacement
    , transitions
    , discoveredState
    , currentStateKey = ''
    , discoveredStateKey = ''
    , transitionTable = {}
    , newTransitionTable = {}
    , replacementMap = {}
    , inverseReplacementMap = {}
    , acceptStates = []
    , tempAcceptStates = []
    , collisionMap = {}
    , aliasMap = {}

  // Construye la tabla de transición
  while(processStack.length > 0) {
    current = processStack.pop()
    currentStateKey = current.join(delimiter)
    transitionTable[currentStateKey] = []

    // Haz que todos los personajes salgan de este estado
    exitChars = exits(current)

    // Ejecute goTo en cada char
    for(i=0, ii=exitChars.length; i<ii; ++i) {
      discoveredState = goesTo(current, exitChars[i])
      discoveredStateKey = discoveredState.join(delimiter)

      if(!transitionTable[discoveredStateKey] && discoveredStateKey != currentStateKey) {
        processStack.push(discoveredState)
      }

      // Un microestado es un estado de aceptación si contiene algún microestado de aceptación
      for(j=0, jj=discoveredState.length; j<jj; ++j) {
        if(frag.accept.indexOf(discoveredState[j]) >= 0 &&
          acceptStates.indexOf(discoveredStateKey) < 0) {
          acceptStates.push(discoveredStateKey)
        }
      }

      transitionTable[currentStateKey].push(exitChars[i], discoveredStateKey)
    }
  }

  /*
   * En este punto, en realidad tenemos un DFA correcto, y el resto de esta lógica es solo limpiar
   * los estados compuestos en algo más legible para los humanos
   */

  /*
  * Si un macroestado contiene solo un estado aceptado originalmente
  * entonces debemos reemplazar su nombre con el nombre de ese estado
  * para que las etiquetas tengan sentido
  */
  for(k in transitionTable) {
    // Cree una matriz de estados en este macroestado que sean estados aceptados
    var states = k.split(delimiter)
      , accepted = []

    for(i=0, ii=states.length; i<ii; ++i) {
      if(frag.accept.indexOf(states[i]) > -1) {
        accepted.push(states[i])
      }
    }

    // Este macroestado solo tiene un estado aceptado
    if(accepted.length === 1) {
      accepted = accepted[0]
      // Compruebe si hay una colisión.
      if(collisionMap[accepted] != null) {
        delete replacementMap[collisionMap[accepted]]
      }
      else {
        replacementMap[k] = accepted
        collisionMap[accepted] = k
      }
    }
  }

  // En este punto, replaceMap es {findstate: replacestate}

  // Continúe y reemplace findstate con reemplazostate en todas partes en el DFA

  replacement = replacementMap[initialStateKey]

  if(replacement != null) {
    initialStateKey = replacement
  }

  for(k in transitionTable) {
    transitions = transitionTable[k]

    for(j=1, jj=transitions.length; j<jj; j+=2) {
      replacement = replacementMap[transitions[j]]

      if(replacement != null) {
        transitions[j] = replacement
      }
    }

    replacement = replacementMap[k]

    if(replacement != null) {
      newTransitionTable[replacement] = transitions
    }
    else {
      newTransitionTable[k] = transitions
    }
  }

  for(j=0, jj=acceptStates.length; j<jj; ++j) {
    replacement = replacementMap[acceptStates[j]]
    if(replacement != null) {
      if(tempAcceptStates.indexOf(replacement) < 0) {
        tempAcceptStates.push(replacement)
      }
    }
    else if(tempAcceptStates.indexOf(acceptStates[j]) < 0) {
      tempAcceptStates.push(acceptStates[j])
    }
  }

  // Bien, ahora tenemos que decirle al usuario qué estados de DFA pertenecen en cada estado de NFA
  for(k in replacementMap) {
    if(inverseReplacementMap[k] == null) {
      inverseReplacementMap[k] = replacementMap[k].split(delimiter)
    }
    // El caso contrario nunca sucederas ya que replacementMap[k] no excede en 1 en el length
    // Dado que eso sería una colisión y nos encargamos de eso arriba
  }

  // Use el mapa inverso para crear el aliasMap
  for(k in newTransitionTable) {
    aliasMap[k] = inverseReplacementMap[k] ? inverseReplacementMap[k] : k.split(delimiter)
  }

  // Devuelve la definición
  return {
    initial: initialStateKey
  , accept: tempAcceptStates
  , transitions: newTransitionTable
  , aliasMap: aliasMap
  }
}

module.exports = nfa2dfa
