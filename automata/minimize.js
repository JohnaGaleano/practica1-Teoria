var deepEqual = require('./deepEqual')

function minimize (dfa) {
  var groups = []
    , marks = [false, false]
    , stateToGroupMap = {}
    , newTransitions = {}
    , newAccept = []
    , transitions
    , state
    , grp
    , k
    , c
    , temp
    , aliasMap = {}
    , i = 0
    , ii = 0

  groups[0] = dfa.accept // Estados de aceptacion
  groups[1] = [] // Estados de rechazo
  for(k in dfa.transitions) {
    if(groups[0].indexOf(k) < 0) {
      groups[1].push(k)
      stateToGroupMap[k] = 1
    }
    else {
      stateToGroupMap[k] = 0
    }
  }

  function buildStateToGroupMap () {
    var group
      , i = 0
      , ii = groups.length
      , j = 0
      , jj = 0

    stateToGroupMap = {}

    for(; i<ii; ++i) {
      group = groups[i]

      for(j=0, jj=group.length; j<jj; j++) {
        stateToGroupMap[group[j]] = i
      }
    }
  }

  function getUnmarkedGroup () {
    for(var i=0, ii=marks.length; i<ii; ++i) {
      if(!marks[i]) {
        return i
      }
    }

    return -1
  }

  function partition (table) {
    var firstState = Object.keys(table)[0]
      , subGroups = [[table[firstState], firstState]]
      , row
      , k = ''
      , j = 0
      , jj = 0
      , found = false

    delete table[firstState]

    for(k in table) {
      row = table[k]
      found = false

      for(j=0, jj=subGroups.length; j<jj; ++j) {
        if(deepEqual(row, subGroups[j][0])) {
          subGroups[j].push(k)
          found = true
          break
        }
      }

      if(!found) {
        subGroups.push([row, k])
      }
    }

    return subGroups
  }

  function isConsistent (groupIndex) {
    var states = groups[groupIndex]
      , table = {}
      , partitions

    if(states.length === 1) {
      return true
    }

    for(var i=0, ii=states.length; i<ii; ++i) {
      var transitions = dfa.transitions[states[i]]
      table[states[i]] = {}

      for(var j=0, jj=transitions.length; j<jj; j+=2) {
        table[states[i]][transitions[j]] = stateToGroupMap[transitions[j+1]]
      }
    }

    partitions = partition(table)

    if(partitions.length === 1) {
      return true
    }
    else {
      return partitions
    }
  }

  while(true) {
    var group = getUnmarkedGroup()
      , partitions

    if(group < 0) {
      break
    }

    partitions = isConsistent(group)

    if(partitions === true) {
      marks[group] = true
    }
    else {
      groups.splice(group, 1)

      for(i=0, ii=partitions.length; i<ii; ++i) {
        groups.push(partitions[i].slice(1))
      }

      buildStateToGroupMap()

      // Desmarcando todo otra vez
      marks = new Array(groups.length)
      for(i=0, ii=marks.length; i<ii; ++i) {
        marks[i] = false
      }
    }
  }

  /*
  * En este punto tenemos los estados puestos en clases de equivalencia
  * ahora solo reemplazamos cada estado con su índice de grupo, excepto
  * para los estados de aceptación, que utilizamos el mismo nombre por conveniencia
  */

  // MAP acepta estados de regreso a sí mismos
  for(i=0, ii=dfa.accept.length; i<ii; ++i) {
    state = dfa.accept[i]
    grp = stateToGroupMap[state]

    for(k in stateToGroupMap) {
      if(stateToGroupMap[k] === grp) {
        stateToGroupMap[k] = state
      }
    }
  }

  // stateToGroupMap ya ha sido parcheado para asignar los estados de aceptación de nuevo a sí mismos
  // Esto reemplaza el estado inicial en caso de que fuera reemplazado
  dfa.initial = stateToGroupMap[dfa.initial]

  // La fusión de deduplicaciones acepta estados
  for(i=0, ii=dfa.accept.length; i<ii; ++i) {
    temp = stateToGroupMap[dfa.accept[i]]

    if(newAccept.indexOf(temp) < 0) {
      newAccept.push(temp)
    }
  }

  dfa.accept = newAccept

  for(k in dfa.transitions) {
    grp = stateToGroupMap[k]

    temp = []
    transitions = dfa.transitions[k]

    for(i=0, ii=transitions.length; i<ii; i+=2) {
      temp.push(transitions[i], stateToGroupMap[transitions[i+1]])
    }

    // Como los grupos son equivalentes, solo necesitamos agregar las transiciones una vez
    // ¡agregar más sería simplemente agregar transiciones duplicadas!
    if(newTransitions[grp] == null) {
      newTransitions[grp] = temp
    }

    if(aliasMap[grp] == null) {
      aliasMap[grp] = dfa.aliasMap[k]
    }
    else {
      for(i=0, ii=dfa.aliasMap[k].length; i<ii; ++i) {
        c = dfa.aliasMap[k][i]

        // Evite duplicados en el MAP de alias que pueden resultar de
        // Microestados de DFA que comparten estados que se fusionan
        if(aliasMap[grp].indexOf(c) < 0) {
          aliasMap[grp].push(c)
        }
      }
    }
  }

  dfa.aliasMap = aliasMap
  dfa.transitions = newTransitions

  return dfa
}

module.exports = minimize
