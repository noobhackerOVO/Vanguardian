﻿// Version 1.2.4

const Command = require('command')

module.exports = function Vanguardian(dispatch) {
	const command = Command(dispatch)
	
	let cid,
		battleground,
		inbattleground,
		alive,
		questid = 0,
		timeout = null,
		timeoutdaily = null,
		timeoutweekly = null,
		daily = 0,
		weekly = 0,
		enabled = true
		
	// ############# //
	// ### Magic ### //
	// ############# //
	
	dispatch.hook('S_LOGIN', 10, event => { 
		cid = event.gameId
		questid = 0
		daily = 0
		weekly = 0
		timeout = null
		timeoutdaily = null
		timeoutweekly = null
	})
		
	dispatch.hook('S_COMPLETE_EVENT_MATCHING_QUEST', 1, event => {
		questid = event.id
		if(questid != 0) timeout = setTimeout(CompleteQuest, 2000) // try to complete the quest after 2 seconds
		return false
	})
	
	dispatch.hook('S_AVAILABLE_EVENT_MATCHING_LIST', 1, event => {
		daily = event.unk4
		weekly = event.unk6
	})
	
	// ######################## //
	// ### Helper Functions ### //
	// ######################## //
	
	function CompleteQuest() {
		clearTimeout(timeout)
		if(!enabled) return
		if(alive && !inbattleground) { // if alive and not in a battleground
			dispatch.toServer('C_COMPLETE_DAILY_EVENT', 1, { id: questid })
			questid = 0
			if(daily < 16) {
				daily++
				weekly++
                command.message('<font color="#FFD700" size="25">[H每日任务:]今天你已經完成 ' + `<font color="#FF0000"  size="30">${daily}</font>` + ' <font color="#FFD700" size="25">個H.')
			}
            else command.message('<font color="#FFD700" size="25">[H每日任务:]今天你已經完成所有 ' + `<font color="#FF0000"  size="30">${daily}</font>` + ' <font color="#FFD700" size="25">個H.')
			if(daily == 3 || daily == 8) timeoutdaily = setTimeout(CompleteDaily, 1000)
			if(weekly == 16) timeoutweekly = setTimeout(CompleteWeekly, 1500)
		}
		else timeout = setTimeout(CompleteQuest, 5000) // if dead or busy, retry to complete quest after 5 seconds
	}
	
	function CompleteDaily() {
		clearTimeout(timeoutdaily)
		if(!enabled) return
		if(alive && !inbattleground) { // if alive and not in a battleground
			dispatch.toServer('C_COMPLETE_EXTRA_EVENT', 1, { type: 1 })
		}
		else timeoutdaily = setTimeout(CompleteDaily, 5000) // if dead or busy, retry to complete quest after 5 seconds
	}
	
	function CompleteWeekly() {
		clearTimeout(timeoutweekly)
		if(!enabled) return
		if(alive && !inbattleground) { // if alive and not in a battleground
			dispatch.toServer('C_COMPLETE_EXTRA_EVENT', 1, { type: 0 })
		}
		else timeoutweekly = setTimeout(CompleteWeekly, 5000) // if dead or busy, retry to complete quest after 5 seconds
	}
	
	// ############## //
	// ### Checks ### //
	// ############## //
		
	dispatch.hook('S_BATTLE_FIELD_ENTRANCE_INFO', 1, event => { battleground = event.zone })
	dispatch.hook('S_LOAD_TOPO', 3, event => {
		inbattleground = event.zone == battleground
	})
	
	dispatch.hook('S_SPAWN_ME', 2, event => { alive = event.alive })
	dispatch.hook('S_CREATURE_LIFE', 2, event => {
		if(event.gameId.equals(cid)) {
			alive = event.alive
		}
	})
	
	// ################# //
	// ### Chat Hook ### //
	// ################# //
	
	command.add('vg', (param) => {
		if(param == null) {
			enabled = !enabled
            command.message('[H每日任务:] ' + (enabled ? '<font color="#56B4E9">enabled</font>' : '<font color="#E69F00">disabled</font>'))
            console.log('[H每日任务:] ' + (enabled ? 'enabled' : 'disabled'))
		}
		else if(param == "daily") {
            command.message('<font color="#FFD700" size="25">[H每日任务:]今天你已經完成 ' + `<font color="#FF0000"  size="30">${daily}</font>` + ' <font color="#FFD700" size="25">個H.')
		}
		else command.message('Commands:<br>'
							+ ' "vg" (enable/disable Vanguardian),<br>'
							+ ' "vg daily" (Tells you how many Vanguard Requests you completed today")'
			)
	})
}
