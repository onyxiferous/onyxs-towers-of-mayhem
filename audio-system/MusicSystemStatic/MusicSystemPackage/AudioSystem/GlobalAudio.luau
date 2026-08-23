--!strict

local ReplicatedStorage = game:GetService('ReplicatedStorage')
local SoundService = game:GetService('SoundService')
local GlobalAudio = {}

-- ========================================================================================================================================================================= --

GlobalAudio.ActiveAudio = nil :: Folder?
GlobalAudio.ActiveConfiguration = nil :: any?

local eventsPath = ReplicatedStorage.Events.MusicSystemEvents
local GLOBAL_AUDIO_TAG = 'Global Audio'

-- ========================================================================================================================================================================= --

GlobalAudio.GetGlobalAudio = function(searchLocation: Folder | Model)
	local collectedGlobalAudio = {}
	for _, globalAudio: Folder in searchLocation:GetChildren() do
		if not globalAudio:IsA('Folder') and not globalAudio:HasTag(GLOBAL_AUDIO_TAG) then
			continue
		end
		
		table.insert(collectedGlobalAudio, globalAudio)
	end
	
	return collectedGlobalAudio
end

GlobalAudio.StartPlayingAudio = function(globalAudio: Folder?)
	print('[GLOBAL]: Started playing global audio.')
	
	local mus = SoundService.Mus
	local activeAudio = globalAudio or GlobalAudio.ActiveAudio
	GlobalAudio.ActiveConfiguration = activeAudio and require(activeAudio:FindFirstChild('ConfigurationModule') :: any) :: any
	
	if GlobalAudio.ActiveConfiguration then
		mus.TimePosition = 0
		mus.Volume = 0.5
		mus.SoundId = GlobalAudio.ActiveConfiguration.SoundId
	
		eventsPath.UpdateGUI:Fire(GlobalAudio.ActiveConfiguration.Metadata, {})
	end
end

-- ========================================================================================================================================================================= --

return GlobalAudio