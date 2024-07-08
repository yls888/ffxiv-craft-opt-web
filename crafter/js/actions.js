function Action(shortName, name, durabilityCost, cpCost, successProbability, qualityIncreaseMultiplier, progressIncreaseMultiplier, aType, activeTurns, cls, level, onGood, onExcellent, onPoor, isCombo, comboActions) {
    this.shortName = shortName;
    this.name = name;
    this.durabilityCost = durabilityCost;
    this.cpCost = cpCost;
    this.successProbability = successProbability;
    this.qualityIncreaseMultiplier = qualityIncreaseMultiplier;
    this.progressIncreaseMultiplier = progressIncreaseMultiplier;
    this.type = aType;

    if (aType != 'immediate') {
        this.activeTurns = activeTurns; // Save some space
    } else {
        this.activeTurns = 1;
    }

    this.cls = cls;
    this.level = level;
    this.onGood = onGood;
    this.onExcellent = onExcellent;
    this.onPoor = onPoor;
    // Ranged edit - Comboactions experimental
    this.isCombo = isCombo;
    this.comboActions = comboActions;

    this.noCountDowns = ['finalAppraisal', 'heartAndSoul', 'quickInnovation'].includes(shortName);
}

// Actions Table
//==============
//parameters: shortName,  name, durabilityCost, cpCost, successProbability, qualityIncreaseMultiplier, progressIncreaseMultiplier, aType, activeTurns, cls, level,onGood, onExcl, onPoor
var AllActions = {
    observe: new Action('observe', 'Observe', 0, 7, 1.0, 0.0, 0.0, 'immediate', 1, 'All', 13),

    basicSynth: new Action('basicSynth', 'Basic Synthesis', 10, 0, 1.0, 0.0, 1.0, 'immediate', 1, 'All', 1),
    basicSynth2: new Action('basicSynth2', 'Basic Synthesis', 10, 0, 1.0, 0.0, 1.2, 'immediate', 1, 'All', 31),
    carefulSynthesis: new Action('carefulSynthesis', 'Careful Synthesis', 10, 7, 1.0, 0.0, 1.5, 'immediate', 1, 'All', 62),
    carefulSynthesis2: new Action('carefulSynthesis2', 'Careful Synthesis', 10, 7, 1.0, 0.0, 1.8, 'immediate', 1, 'All', 82),
    rapidSynthesis: new Action('rapidSynthesis', 'Rapid Synthesis', 10, 0, 0.5, 0.0, 2.5, 'immediate', 1, 'All', 9),
    flawlessSynthesis: new Action('flawlessSynthesis', 'Flawless Synthesis', 10, 15, 0.9, 0.0, 1.0, 'immediate', 1, 'All', 37),

    basicTouch: new Action('basicTouch', 'Basic Touch', 10, 18, 1.0, 1.0, 0.0, 'immediate', 1, 'All', 5),
    standardTouch: new Action('standardTouch', 'Standard Touch', 10, 32, 1.0, 1.25, 0.0, 'immediate', 1, 'All', 18),
    hastyTouch: new Action('hastyTouch', 'Hasty Touch', 10, 0, 0.6, 1.0, 0.0, 'immediate', 1, 'All', 9),
    byregotsBlessing: new Action('byregotsBlessing', 'Byregot\'s Blessing', 10, 24, 1.0, 1.0, 0.0, 'immediate', 1, 'All', 50),

    mastersMend: new Action('mastersMend', 'Master\'s Mend', 0, 88, 1.0, 0.0, 0.0, 'immediate', 1, 'All', 7),
    tricksOfTheTrade: new Action('tricksOfTheTrade', 'Tricks of the Trade', 0, 0, 1.0, 0.0, 0.0, 'immediate', 1, 'All', 13, true, true),

    innerQuiet: new Action('innerQuiet', 'Inner Quiet', 0, 18, 1.0, 0.0, 0.0, 'countup', 1, 'All', 11),
    manipulation: new Action('manipulation', 'Manipulation', 0, 96, 1.0, 0.0, 0.0, 'countdown', 8, 'All', 65),
    wasteNot: new Action('wasteNot', 'Waste Not', 0, 56, 1.0, 0.0, 0.0, 'countdown', 4, 'All', 15),
    wasteNot2: new Action('wasteNot2', 'Waste Not II', 0, 98, 1.0, 0.0, 0.0, 'countdown', 8, 'All', 47),
    veneration: new Action('veneration', 'Veneration', 0, 18, 1.0, 0.0, 0.0, 'countdown', 4, 'All', 15),
    innovation: new Action('innovation', 'Innovation', 0, 18, 1.0, 0.0, 0.0, 'countdown', 4, 'All', 26),
    greatStrides: new Action('greatStrides', 'Great Strides', 0, 32, 1.0, 0.0, 0.0, 'countdown', 3, 'All', 21),

    // Heavensward actions
    preciseTouch: new Action('preciseTouch', 'Precise Touch', 10, 18, 1.0, 1.5, 0.0, 'immediate', 1, 'All', 53, true, true),
    muscleMemory: new Action('muscleMemory', 'Muscle Memory', 10, 6, 1.0, 0.0, 3.0, 'countdown', 5, 'All', 54),

    // Stormblood actions
    rapidSynthesis2: new Action('rapidSynthesis2', 'Rapid Synthesis', 10, 0, 0.5, 0.0, 5.0, 'immediate', 1, 'All', 63),
    prudentTouch: new Action('prudentTouch', 'Prudent Touch', 5, 25, 1.0, 1.0, 0.0, 'immediate', 1, 'All', 66),
    //focusedSynthesis: new Action('focusedSynthesis', 'Focused Synthesis', 10, 5, 0.5, 0.0, 2.0, 'immediate', 1, 'All', 67),
    //focusedTouch: new Action('focusedTouch', 'Focused Touch', 10, 18, 0.5, 1.5, 0.0, 'immediate', 1, 'All', 68),
    reflect: new Action('reflect', 'Reflect', 10, 6, 1.0, 3.0, 0.0, 'immediate', 1, 'All', 69),

    // ShadowBringers actions
    preparatoryTouch: new Action('preparatoryTouch', 'Preparatory Touch', 20, 40, 1.0, 2.0, 0.0, 'immediate', 1, 'All', 71),
    groundwork: new Action('groundwork', 'Groundwork', 20, 18, 1.0, 0.0, 3.0, 'immediate', 1, 'All', 72),
    groundwork2: new Action('groundwork2', 'Groundwork', 20, 18, 1.0, 0.0, 3.6, 'immediate', 1, 'All', 86),
    delicateSynthesis: new Action('delicateSynthesis', 'Delicate Synthesis', 10, 32, 1.0, 1.0, 1.0, 'immediate', 1, 'All', 76),
    intensiveSynthesis: new Action('intensiveSynthesis', 'Intensive Synthesis', 10, 6, 1.0, 0.0, 4.0, 'immediate', 1, 'All', 78, true, true),
    trainedEye: new Action('trainedEye', 'Trained Eye', 0, 250, 1.0, 0.0, 0.0, 'immediate', 1, 'All', 80),
    finalAppraisal: new Action('finalAppraisal', 'Final Appraisal', 0, 1, 1.0, 0.0, 0.0, 'countdown', 5, 'All', 42),

    //EndWalker actions
    advancedTouch: new Action('advancedTouch', 'Advanced Touch', 10, 46, 1.0, 1.5, 0.0, 'immediate', 1, 'All', 68),
    heartAndSoul: new Action('heartAndSoul', 'Heart and Soul', 0, 0, 1.0, 0.0, 0.0, 'countup', 2, 'All', 86),
    prudentSynthesis: new Action('prudentSynthesis', 'Prudent Synthesis', 5, 18, 1.0, 0.0, 1.8, 'immediate', 1, 'All', 88),
    trainedFinesse: new Action('trainedFinesse', 'Trained Finesse', 0, 32, 1.0, 1.0, 0.0, 'immediate', 1, 'All', 90),

    //DawnTrail actions
    refinedTouch: new Action('refinedTouch', 'Refined Touch', 10, 24, 1.0, 1.0, 0.0, 'immediate', 1, 'All', 92),
    delicateSynthesis2: new Action('delicateSynthesis2', 'Delicate Synthesis', 10, 32, 1.0, 1.0, 1.5, 'immediate', 1, 'All', 94),
    daringTouch: new Action('daringTouch', 'Daring Touch', 10, 0, 0.6, 1.5, 0.0, 'immediate', 1, 'All', 96),
    quickInnovation: new Action('quickInnovation', 'Quick Innovation', 0, 0, 1.0, 0.0, 0.0, 'countdown', 1, 'All', 96),
    immaculateMend: new Action('immaculateMend', 'Immaculate Mend', 0, 112, 1.0, 0.0, 0.0, 'immediate', 1, 'All', 98),
    trainedPerfection: new Action('trainedPerfection', 'Trained Perfection', 0, 0, 1.0, 0.0, 0.0, 'countup', 1, 'All', 100),

    // Ranged edit: special combo'd actions that are handled differently
    // Combo Actions. Making new combo actions need an image, extraActionInfo, and some code in getComboAction() in ffxivcraftmodel.js
    // The existence of this breaks the montecarlo simulation but idgaf about that
    //                              shortName,              fullName,              dur,     cp, Prob, QIM, PIM, Type,          t,  cls,           lvl,  onGood,     onExcl,      onPoor,    isCombo,    comboName1,     comboName2
    focusedTouchCombo: new Action('focusedTouchCombo', 'Focused Touch Combo', 10, 25, 1.0, 1.5, 0.0, 'immediate', 1, 'All', 68, false, false, false, true, ['observe', 'focusedTouch']),
    focusedSynthesisCombo: new Action('focusedSynthesisCombo', 'Focused Synthesis Combo', 10, 12, 1.0, 0.0, 2.0, 'immediate', 1, 'All', 67, false, false, false, true, ['observe', 'focusedSynthesis']),
    standardTouchCombo: new Action('standardTouchCombo', 'Standard Touch Combo', 20, 36, 1.0, 2.25, 0.0, 'immediate', 1, 'All', 18, false, false, false, true, ['basicTouch', 'standardTouch']),
    advancedTouchCombo: new Action('advancedTouchCombo', 'Advanced Touch Combo', 30, 54, 1.0, 3.75, 0.0, 'immediate', 1, 'All', 84, false, false, false, true, ['basicTouch', 'standardTouch', 'advancedTouch']),

    // Special Actions - not selectable
    dummyAction: new Action('dummyAction', '______________', 0, 0, 1.0, 0.0, 0.0, 'immediate', 1, 'All', 1)
};
