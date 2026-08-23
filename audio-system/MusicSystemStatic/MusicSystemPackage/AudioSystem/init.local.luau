--!strict
																																										--[[
█▄ ▄█             ▀        ▄▀▀▀▄            █              
█ ▀ █ █  █  ▄▀▀▀ ▀█  ▄▀▀▀▄ ▀▄▄▄  █  █ ▄▀▀▀ ▀█▀▀ ▄▀▀▀▄ █▀▄▀▄
█   █ █  █   ▀▀▄  █  █   ▄ ▄   █ ▀▄▄█  ▀▀▄  █ ▄ █▀▀▀▀ █ █ █
▀   ▀  ▀▀ ▀ ▀▀▀  ▀▀▀  ▀▀▀   ▀▀▀     █ ▀▀▀    ▀   ▀▀▀  ▀ ▀ ▀
                                 ▀▀▀                                              
																																											--]]

local UserInputService = game:GetService('UserInputService')
local ReplicatedStorage = game:GetService('ReplicatedStorage')
local Players = game:GetService('Players')

-- ========================================================================================================================================================================= --

local ZoneGroup = require(script.ZoneGroup)
local ZoneObject = require(script.ZoneGroup.ZoneObject)
local GlobalAudio = require(script.GlobalAudio)

local player = Players.LocalPlayer or Players.PlayerAdded:Wait()
local baseFolder = script.Parent

local assetsFolder = ReplicatedStorage.MusicSystemAssets
local zoneThreads: {[ZoneObject.ZoneObject]: thread} = {}
local zoneParts: {BasePart}
local zoneGroups = ZoneGroup.GetZoneGroups(assetsFolder.Zones, player)
local globalAudio = GlobalAudio.GetGlobalAudio(assetsFolder.Global)
local eventsPath = ReplicatedStorage.Events.MusicSystemEvents

-- ========================================================================================================================================================================= --

function startDetectionThread(zoneObject: ZoneObject.ZoneObject, ...)
	return game:GetService('RunService').Heartbeat:Connect(function(deltaTime)
		zoneObject:Heartbeat(deltaTime)
	end)
end

GlobalAudio.ActiveAudio = assetsFolder.Global.MainLobby
GlobalAudio.StartPlayingAudio()

for zoneGroup, zones in zoneGroups do
	local zoneCount: number = #zones
	for _, zoneObject in zones do
		zoneThreads[zoneObject] = task.spawn(startDetectionThread, zoneObject, ...)	
	end

	print(`[SUCCESS]: Audio zone group {zoneGroup.ZoneContainer.Name} loaded with {zoneCount} audio zones`)
end

repeat task.wait() until player:WaitForChild("PlayerGui"):FindFirstChild('AudioPlayerGUI')
eventsPath.UpdateGUI:Fire(GlobalAudio.ActiveConfiguration and GlobalAudio.ActiveConfiguration.Metadata, {})