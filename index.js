const JOB_VALK = 12;
let rbIds = [160100, 160130, 160199, 160200, 160230, 160299, 160300, 160330, 160399, 160400, 160430, 160499, 160500, 160530, 160599, 160600, 160630, 160699, 160700, 160730, 160799, 160800, 160830, 160899, 160900, 160930, 160999, 161000, 161030, 161099, 161100, 161130, 161199, 
161200, 161230, 161299, 
165100, 165130, 165200, 165230, 165300, 165330, 165400, 165430, 165500, 165530, 165600, 165630, 165700, 165730, 165800, 165830, 165900, 165930, 166000, 166030, 166100, 166130, 166200, 166230]
let hitIds = [160120, 160220, 160320, 160420, 160520, 160620, 160720, 160820, 160920, 161020, 161120, 161220, 165120, 165220, 165320, 165420, 165520, 165620, 165720, 165820, 165920, 166020, 166120, 166220]

module.exports = function ValkFastRB(mod) {
	const command = mod.require.command || mod.command;
	let gameId = 0n,
		model = 0,
		job = 0;
	let goodClass = false;
	let runes = 0, castedRunes = 0, hitRunes = 0, passCancel = false;
	let canceler =  [], blocker = [], unblocker = [], safeAction = [], delayer = [], cancelPacket = null;
	
	command.add('valkrb', (arg,value) =>{
		if(!arg){
			mod.settings.enabled = !mod.settings.enabled;
			command.message("Quick Runeburst module is now : " + (mod.settings.enabled?"Enabled":"Disabled"));
			mod.saveSettings();
			return;
		}
		switch(arg){
			case 'on':
				mod.settings.enabled = true;
				command.message("Quick Runeburst module is now : " + (mod.settings.enabled?"Enabled":"Disabled"));
				break;
			case 'off':
				mod.settings.enabled = false;
				command.message("Quick Runeburst module is now : " + (mod.settings.enabled?"Enabled":"Disabled"));
				break;
			case 'delay':
				if(isNaN(value)){
					command.message("Delay has to be a number.");
					return;
				}
				mod.settings.delay = Number(value);
				command.message('Delay set to : ' + value)
				break;
			case 'hits':
				if(isNaN(value)){
					command.message("Hits amount has to be a number.");
					return;
				}
				mod.settings.setRunes = Number(value);
				command.message('Hits amount set to : ' + value )
				break;
			case 'mode':
				if(!value){
					command.message('Missing mode argument. ( hits | delay ) ')
				}
				if( ['hits','delay'].includes(value) ){
					mod.settings.mode = value;
					command.message("Cancel mode set to : " + value);
				}else{
					command.message("Cancel mode options : hits | delay ");
				}
				break;
			case 'ping':
				if( !value || isNaN(value) ){
					command.message('Ping amount has to be a number')
				}
				else{
					mod.settings.myAveragePing = Number(value);
					command.message("Average ping set to : " + value);
				}
				break;
			case 'setup':
				command.message("ValkRuneburst current settup :");
				command.message("Enabled : " + mod.settings.enabled);
				command.message("Mode : " + mod.settings.mode);
				command.message("Delay : " + mod.settings.delay);
				command.message("Hits : " + mod.settings.setRunes);
				command.message("Ping : " + mod.settings.myAveragePing);
				break;
			default:
				command.message("Unknown command. Available commands are : on|off|delay {Value}");
				break;
		}
		mod.saveSettings();
	});
	
	mod.hook('S_LOGIN', 14, { order : Infinity }, event => {
	    gameId = event.gameId;
	    model = event.templateId;
	    job = (model - 10101) % 100;
	    goodClass = [JOB_VALK].includes(job);
		if(!mod.settings.myAveragePing) {
			mod.settings.myAveragePing = 75;
			mod.setTimeout(()=>{
				command.message("Please set your average ping using /8 valkrb ping VALUE (default set to 75)");
				command.message("Please set your average ping using /8 valkrb ping VALUE (default set to 75)");
				command.message("Please set your average ping using /8 valkrb ping VALUE (default set to 75)");
				command.message("Please set your average ping using /8 valkrb ping VALUE (default set to 75)");
				console.log("Please set your average ping using /8 valkrb ping VALUE (default set to 75)");
				console.log("Please set your average ping using /8 valkrb ping VALUE (default set to 75)");
				console.log("Please set your average ping using /8 valkrb ping VALUE (default set to 75)");
				console.log("Please set your average ping using /8 valkrb ping VALUE (default set to 75)");
			}, 10000)
		}
	});

	mod.hook('S_WEAK_POINT', 1, event => {
		runes = event.runemarksAdded;
	})
	
	mod.hook('S_ACTION_STAGE', 9, {	order : 100, filter: {fake: null} }, event => {
		if(event.gameId != gameId) return;
		if( rbIds.includes( event.skill.id ) ) return;
			for(let cast in canceler) mod.unhook(canceler[cast])
			canceler = [];
			for(let block in blocker) mod.unhook(blocker[block])
			blocker = [];
			for(let unblock in unblocker) mod.clearTimeout(unblocker[unblock])
			unblocker = [];
			for(let delay in delayer) mod.clearTimeout(delayer[delay])
			delayer = [];
			for(let safe in safeAction) mod.unhook(safeAction[safe])
			safeAction = [];
	})
	
    mod.hook('C_START_SKILL', 7, { order : 100, filter: { fake: null } }, event => {
        if (!mod.settings.enabled) return;
		if( ! rbIds.includes( event.skill.id ) ) return;		
		safeAction.push( mod.hook('S_ACTION_END', 5, { filter: { fake: null } }, (event)=>{
			if(!mod.settings.enabled || !goodClass) return
			if(event.gameId != gameId) return;
				if( rbIds.includes(event.skill.id) ){
					for(let safe in safeAction) mod.unhook(safeAction[safe])
					safeAction = [];
					return;
				}else {
					event.type = 4;
					return true;
				}
		}))
    });
	
	mod.hook('S_ACTION_STAGE', 9, { order : 100, filter: {fake: null} }, event => {
		if(!mod.settings.enabled || !goodClass) return;
		if(event.gameId != gameId) return;
		if( !( rbIds ).includes( event.skill.id ) ) return;
		event.effectScale = 1;
		switch(mod.settings.mode){
			case 'hits':
				castedRunes = runes;
				hitRunes = 0;
				blocker.push(mod.hook('C_START_SKILL', 7, {order: -Infinity}, (event)=>{
					if(![140100,140101,140199].includes(event.skill.id)) return false;
				}))
				canceler.push(mod.hook('S_EACH_SKILL_RESULT', 14, (e)=>{
					if( !( hitIds.includes(e.skill.id) ) ) return;
						hitRunes++;
						if(hitRunes == castedRunes || hitRunes == mod.settings.setRunes){
							mod.toClient('S_ACTION_END', 5, {
								gameId : gameId,
								loc: event.loc,
								w: event.w,
								templateId: model,
								skill: event.skill.id,
								type: 999999,
								id: event.id
							});
							for(let cast in canceler) mod.unhook(canceler[cast])
							canceler = [];
							for(let block in blocker) mod.unhook(blocker[block])
							blocker = [];
							for(let unblock in unblocker) mod.clearTimeout(unblocker[unblock])
							unblocker = [];
						}
				}))
				unblocker.push(mod.setTimeout(()=>{
					mod.toClient('S_ACTION_END', 5, {
						gameId : gameId,
						loc: event.loc,
						w: event.w,
						templateId: model,
						skill: event.skill.id,
						type: 999999,
						id: event.id
					});
					for(let cast in canceler) mod.unhook(canceler[cast])
					canceler = [];
					for(let block in blocker) mod.unhook(blocker[block])
					blocker = [];
					for(let unblock in unblocker) mod.clearTimeout(unblocker[unblock])
					unblocker = [];
				}, 1328 - mod.settings.myAveragePing))
				break;
			case 'delay':
				if(rbIds.includes(event.skill.id)){
					event.speed = 1 * 1312/((mod.settings.delay==0)?1:mod.settings.delay);
					event.projectileSpeed = 1 * 1312/((mod.settings.delay==0)?1:mod.settings.delay);
					cancelPacket = {
							gameId : gameId,
							loc: event.loc,
							w: event.w,
							templateId: model,
							skill: event.skill.id,
							type: 999999,
							id: event.id
						};
					delayer.push(mod.setTimeout(() => {
						mod.toClient('S_ACTION_END', 5, cancelPacket);
					}, mod.settings.delay))
				}
				break;
			default:
				command.message('Please correct your selected cancel mode!');
				console.error('Please correct your selected cancel mode!');
				break;
		}
		return true;
	});
	
	mod.hook('S_EACH_SKILL_RESULT', 14, {order: -Infinity, filter: {fake: null}}, event => { // for plebs that can't dodge
		if(!mod.settings.enabled || !goodClass) return
			if(event.target != gameId) return;
				if(!event.reaction.enable) return;
					for(let cast in canceler) mod.unhook(canceler[cast])
					canceler = [];
					for(let block in blocker) mod.unhook(blocker[block])
					blocker = [];
					for(let unblock in unblocker) mod.clearTimeout(unblocker[unblock])
					unblocker = [];
					for(let delay in delayer) mod.clearTimeout(delayer[delay])
					delayer = [];
					for(let safe in safeAction) mod.unhook(safeAction[safe])
					safeAction = [];
	});
	
	mod.hook('C_CANCEL_SKILL', 3, {order: -Infinity, filter: {fake: null}}, event => {
		if(!mod.settings.enabled || !goodClass) return
			if(rbIds.includes(event.skill.id)){
				for(let cast in canceler) mod.unhook(canceler[cast])
				canceler = [];
				for(let block in blocker) mod.unhook(blocker[block])
				blocker = [];
				for(let unblock in unblocker) mod.clearTimeout(unblocker[unblock])
				unblocker = [];
				for(let delay in delayer) mod.clearTimeout(delayer[delay])
				delayer = [];
				for(let safe in safeAction) mod.unhook(safeAction[safe])
				safeAction = [];
				passCancel = true;
				if(cancelPacket){
					cancelPacket.type = event.type;
					mod.toClient('S_ACTION_END', 5, cancelPacket);
					cancelPacket = null;
				}
			}
	});

	mod.hook('S_ACTION_END', 5, {order: -Infinity, filter: {fake: null}}, event => {
		if(!mod.settings.enabled || !goodClass) return
			if(event.gameId != gameId) return;
				if(passCancel){
					passCancel = false;
					return;
				}
				if(rbIds.includes(event.skill.id)) {
					if(event.type == 999999){
						event.type = 4;
						return true;
					}
					else
						return false;
				}
	});
}