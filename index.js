const JOB_VALK = 12;
let skillIDs = [161230,166230];
let cancelIDs = [161200,166200];

module.exports = function ValkFastRB(mod) {
	let command = mod.command;
	let gameId = 0n,
		model = 0,
		job = 0;
	
	command.add('valkrb', (arg,delay) =>{
		if(arg == undefined){
			mod.settings.enabled = !mod.settings.enabled;
			command.message("Quick Runeburst module is now : " + (enabled?"Enabled":"Disabled"));
		}else if(arg == 'on'){
			mod.settings.enabled = true;
			command.message("Quick Runeburst module is now : " + (enabled?"Enabled":"Disabled"));
		}else if(arg == 'off'){
			mod.settings.enabled = false;
			command.message("Quick Runeburst module is now : " + (enabled?"Enabled":"Disabled"));
		}else if(arg == 'delay'){
			if(isNaN){
				command.message("Delay has to be a number.");
				return;
			}
			mod.settings.delay = Number(delay);
		}else{
			command.message("Unknown command. Available commands are : on|off|delay {Value}");
		}
		mod.saveSettings();
	});
	
	mod.hook('S_LOGIN', 'raw', { order : Infinity }, event => {
	    gameId = mod.game.me.gameId;
	    model = mod.game.me.templateId;
	    job = (model - 10101) % 100;
	    mod.settings.enabled = [JOB_VALK].includes(job);
	});

	mod.hook('S_ACTION_STAGE', 9, {order: -Infinity, filter: {fake: null}}, event => {
		if(!mod.settings.enabled) return;
		if(event.gameId != gameId) return;
		
	    if(skillIDs.includes(event.skill.id)) event.skill.id -= 30;
	    if(cancelIDs.includes(event.skill.id)){
	    	mod.setTimeout(() => {
	    		mod.toClient('S_ACTION_END', 5, {
					gameId : gameId,
					loc: event.loc,
					w: event.w,
					templateId: model,
					skill: event.skill.id,
					type: 999999,
					id: event.id,
				});
	    	}, mod.settings.delay);
	    }
	});

	mod.hook('S_ACTION_END', 5, {order: -Infinity, filter: {fake: null}}, event => {
		if(!mod.settings.enabled) return
			if(!event.gameId == gameId) return;
				if(([].concat(skillIDs,cancelIDs)).includes(event.skill.id)) return ((event.type==999999)?event.type=4:0);
	});
}
