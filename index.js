const JOB_VALK = 12;
let skillIDs = [161230,166230];
let cancelIDs = [161200,166200];

module.exports = function ValkFastRB(mod) {
	let command = mod.command;
	let gameId = 0n,
		model = 0,
		job = 0,
		enabled = false,
		delay = 700;
	
	comand.add('valkrb', (arg,delay) =>{
		mod.saveSettings();
		if(arg == undefined){
			enabled = !enabled;
			command.message("Quick Runeburst module is now : " + (enabled?"Enabled":"Disabled"));
		}else if(arg == 'on'){
			enabled = true;
			command.message("Quick Runeburst module is now : " + (enabled?"Enabled":"Disabled"));
		}else if(arg == 'off'){
			enabled = false;
			command.message("Quick Runeburst module is now : " + (enabled?"Enabled":"Disabled"));
		}else if(arg == 'delay'){
			if(isNaN){
				command.message("Delay has to be a number.");
				return;
			}
			delay = Number(delay);
		}else{
			command.message("Unknown command. Available commands are : on|off|delay {Value}");
		}
	});
	
	mod.hook('S_LOGIN', 'raw', { order : Infinity }, event => {
	    gameId = mod.game.me.gameId;
	    model = mod.game.me.templateId;
	    job = (model - 10101) % 100;
	    enabled = [JOB_VALK].includes(job);
	});

	mod.hook('S_ACTION_STAGE', 9, {order: -Infinity, filter: {fake: null}}, event => {
		if(!enabled) return;
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
	    	}, delay);
	    }
	});

	mod.hook('S_ACTION_END', 5, {order: -Infinity, filter: {fake: null}}, event => {
		if(!enabled) return
			if(!event.gameId == gameId) return;
				if(([].concat(skillIDs,cancelIDs)).includes(event.skill.id)) return ((event.type==999999)?event.type=4:return false);
	});
}