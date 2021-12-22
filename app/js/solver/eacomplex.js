//noinspection ThisExpressionReferencesGlobalObjectJS
if (this.ALGORITHMS === undefined) ALGORITHMS = {};

ALGORITHMS['eaComplex'] = {
  setup: function (population, toolbox, hof) {
    // initialize functions
    toolbox.register("mate", yagal_tools.cxRandomSubSeq, 3);
    toolbox.register("mutate1", yagal_tools.mutRandomSubSeq, 3, toolbox.randomActionSeq);
    toolbox.register("mutate2", yagal_tools.mutSwap);
    toolbox.register("mutate3", yagal_tools.mutReverse);
    toolbox.register("mutate", yagal_tools.randomMutation, [toolbox.mutate1, toolbox.mutate2, toolbox.mutate3]);
    toolbox.register("selectParents", yagal_tools.selTournament, 7);
    toolbox.register("selectOffspring", yagal_tools.selBest);
    toolbox.register("selectSurvivors", yagal_tools.selBest);
    //toolbox.register("setInitialGuess", yagal_tools.setStart);

    // evaluate fitness of starting population
    var fitnessesValues = toolbox.map(toolbox.evaluate, population);
    for (var i = 0; i < population.length; i++) {
      population[i].fitness.setValues(fitnessesValues[i]);
    }

    if (hof !== undefined) {
      hof.update(population);
    }
  },
  gen: function (population, toolbox, hof, state) {

    //console.log('---------------gen:%s------------------'.sprintf(state.gen));
    //console.time('gen calculation time')

    function isFitnessInvalid(ind) {
      return !ind.fitness.valid();
    }
    
    function indComp(a, b) {
      return b.fitness.compare(a.fitness);
    }

    function sortWithIndeces(toSort) { // Thanks stackexchange
      for (var i = 0; i < toSort.length; i++) {
        toSort[i] = [toSort[i], i];
      }
      toSort.sort(function(left, right) {
        return left[0] < right[0] ? -1 : 1;
      });
      toSort.sortIndices = [];
      for (var j = 0; j < toSort.length; j++) {
        toSort.sortIndices.push(toSort[j][1]);
        toSort[j] = toSort[j][0];
      }
      return toSort;
    }

    // Split population in 4
    // The population gets divided into this many segments.
    var popDivider = state.subPopulations;
    var nextPop = [];
    var highestFitness = 0;
    var winningSub = 0;
    var losingSubs = state.lastLeaderboard.splice(0, Math.floor(state.lastLeaderboard.length / 1.5));
    //console.log(losingSubs);

    for (var i = 0; i < popDivider; i++) {
      var subPop = population.slice(i * population.length / popDivider, (i +1) * population.length / popDivider)

      // If this subpopulation has stagnated for too long, wipe it back to the starting guess
      // If they are not in the lowest half of the populations, they get 3x as much time to improve
      var losingPop = losingSubs.includes(i);
      if((losingPop && state.stagnationCounters[i] >= state.maxStagnationCounter) || state.stagnationCounters[i] >= state.maxStagnationCounter*3) {
        state.stagnationCounters[i] = 0;
        subPop.fill(state.iniGuess);
        state.logOutput.write('Subpopulation %s has been wiped due to stagnation. \n'.sprintf(i));
      }

      // select parents
      var parents = toolbox.selectParents(subPop.length / 2, subPop);

      // breed offspring
      var offspring = yagal_algorithms.varAnd(parents, toolbox, 0.5, 0.2);

      // evaluate offspring with invalid fitness
      var invalidInd = offspring.filter(isFitnessInvalid);
      var fitnessesValues = toolbox.map(toolbox.evaluate, invalidInd);
      for (var j = 0; j < invalidInd.length; j++) {
        invalidInd[j].fitness.setValues(fitnessesValues[j]);
      }

      // select offspring
      offspring = toolbox.selectOffspring(offspring.length / 2, offspring);

      // select survivors
      var survivors = toolbox.selectSurvivors(subPop.length - offspring.length, subPop);
      survivors = survivors.concat(offspring);
      nextPop = nextPop.concat(survivors);
      
      // After saving the data, sort it by fitness
      survivors.sort(indComp);

      // If the last highest fitness of this subpopulation didn't change, increase the counter
      if(state.lastFitnesses[i] == survivors[0].fitness.weightedValues()[0]) {
        if(isNaN(state.stagnationCounters[i])) {
          state.stagnationCounters[i] = 0;
        }
        state.stagnationCounters[i] += 1;
      }
      else {
        // Otherwise set it to zero
        state.stagnationCounters[i] = 0;
      }

      // Save the last highest fitness of this subpop
      state.lastFitnesses[i] = survivors[0].fitness.weightedValues()[0];
      if(survivors[0].fitness.weightedValues()[0] > highestFitness) {
        highestFitness = survivors[0].fitness.weightedValues()[0]
        winningSub = i; // funny logging meme
      }
      

    }
    //console.log('Winning subpop: %s at fitness: %s'.sprintf(winningSub+1, state.lastFitnesses[winningSub]));
    //console.log('Last fitnesses: %s'.sprintf(state.lastFitnesses));
    //console.log('Stagnation incr: %s'.sprintf(state.stagnationCounters));
    
    // Set the leaderboard: leading subpops get to stay for longer before wiping due to stagnation
    // This leaderboard has the indices of subpops sorted by fitness in ascending order
    var fitnessCopy = state.lastFitnesses.slice();
    state.lastLeaderboard = sortWithIndeces(fitnessCopy).sortIndices;
    //console.log('Leaderboard: %s'.sprintf(state.lastLeaderboard));
    if (hof !== undefined) {
      hof.update(nextPop);
    }
    //console.timeEnd('gen calculation time')
    return nextPop;
  }
};
