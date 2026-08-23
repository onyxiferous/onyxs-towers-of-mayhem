--!strict

local SoundService = game:GetService('SoundService')
local ReplicatedStorage = game:GetService('ReplicatedStorage')
local AudioConfigurationConstructor = require(ReplicatedStorage.Templates.Modules.AudioConfigurationConstructor)
local RenderTools = nil
local CachedAudio = require(ReplicatedStorage.AudioDatabase.CachedAudio)
local GlobalAudio = require(script.Parent.Parent.GlobalAudio)
local ZoneObject = {}
ZoneObject.__index = ZoneObject

-- ========================================================================================================================================================================= --

type self = {
	ZonePart: BasePart,
	Active: boolean,
	Configuration: AudioConfigurationConstructor.BaseConfiguration,
	StaticConfiguration: AudioConfigurationConstructor.BaseConfiguration,
	RunTime: number,
	PartsInBound: {BasePart}
}

export type ZoneObject = typeof(setmetatable({} :: self, ZoneObject))

-- ========================================================================================================================================================================= --

ZoneObject.HeartbeatThrottle = 1/5
ZoneObject.ThrottledByClientFPS = true

ZoneObject.OverlapParams = OverlapParams.new()

ZoneObject.ActiveZones = {} :: {BasePart}
ZoneObject.ActiveZoneObject = nil :: ZoneObject?

ZoneObject.EventsPath = ReplicatedStorage.Events.MusicSystemEvents

ZoneObject.FALLBACK_TITLE = 'Silence'
ZoneObject.FALLBACK_ARTIST = ''
ZoneObject.FALLBACK_ALBUM_ART = ''
ZoneObject.Blacklist = require(ReplicatedStorage.Blacklists.MusicIDsBlacklist)

-- ========================================================================================================================================================================= --

ZoneObject.new = function(zonePart: BasePart, player: Player): ZoneObject
	local self = setmetatable({} :: self, ZoneObject)
	local audioConfiguration = zonePart:FindFirstChild('AudioConfiguration')
	
	self.ZonePart = zonePart
	self.Active = false
	self.Configuration = audioConfiguration
		and require(audioConfiguration) :: AudioConfigurationConstructor.BaseConfiguration
		or self:CreateEmptyConfiguration()
	
	self.StaticConfiguration = self.Configuration
	self.RunTime = 0
	self.PartsInBound = {}

	ZoneObject.OverlapParams.FilterDescendantsInstances = {player.Character or player.CharacterAdded:Wait()}
	ZoneObject.OverlapParams.MaxParts = 1
	ZoneObject.OverlapParams.FilterType = Enum.RaycastFilterType.Include
	return self
end

ZoneObject.CreateEmptyConfiguration = function(self): AudioConfigurationConstructor.BaseConfiguration
	return {
		DynamicAsset = false,
		Metadata = {
			Title = ZoneObject.FALLBACK_TITLE,
			Artist = ZoneObject.FALLBACK_ARTIST,
			AlbumArt = ZoneObject.FALLBACK_ALBUM_ART
		},
		SoundId = ''
	}
end

ZoneObject.ClearActiveZone = function(self: ZoneObject)
	self.Configuration = self:CreateEmptyConfiguration()
	self.Active = false
	ZoneObject.ActiveZoneObject = nil
	
	warn('[ZONE]: Cleared active zone.', self)
	self.UpdateGUI(self, {KeepPosition = false, Muted = false})
	GlobalAudio.StartPlayingAudio()
end

ZoneObject.SwitchActiveZone = function(self: ZoneObject)
	local config = self.ZonePart:FindFirstChild("AudioConfiguration")
	local currentMusic = SoundService.Mus
	local currentSoundId = self.Configuration.SoundId
	local shouldKeepPosition = currentMusic.SoundId == currentSoundId
	
	self.Active = true
	ZoneObject.ActiveZoneObject = self
	
	--# Unknown require: Unsupported path.
	--# Slap a Double Colon™ on that 🅱️.

	self.UpdateGUI(self, {KeepPosition = shouldKeepPosition, Muted = false})
	warn('[ZONE]: Switched active zone.', self)
end

ZoneObject.Heartbeat = function(self: ZoneObject, deltaTime: number): ()
	self.RunTime += deltaTime

	local throttle = ZoneObject.HeartbeatThrottle
	if self.RunTime < math.max(throttle, 1/100) then
		return
	end

	self.RunTime %= throttle
	
	--# Throttles zone performance (because we REALLY shouldn't be checking every zeptosecond.)

	local partsInside = workspace:GetPartsInPart(self.ZonePart, ZoneObject.OverlapParams)
	local isZoneActive = ZoneObject.ActiveZoneObject == self
	local isInside = #partsInside > 0

	if isInside and not isZoneActive then
		self:SwitchActiveZone()
	elseif not isInside and isZoneActive then
		self:ClearActiveZone()
	end
	
	--# Switches the active zone if there is an available zone to be occupied.
	--# Otherwise, if there already is an active zone, the active zone is set to nothing.
end

ZoneObject.UpdateGUI = function(self: ZoneObject, options: AudioConfigurationConstructor.EventOptions)
	local ignoreCache = not self.Active
	local lastCache = CachedAudio.Dump
	
	local soundId = self.StaticConfiguration.SoundId
	local volume = (not self.Active) and 0 or 0.5
	local metadataField = self.StaticConfiguration.Metadata
	
	local metadataTable: AudioConfigurationConstructor.MetadataField = {
		Title = metadataField.Title,
		Artist = metadataField.Artist,
		AlbumArt = metadataField.AlbumArt
	}

	game.SoundService.Mus.Volume = volume
	game.SoundService.Mus.SoundId = soundId
	options.SkipCache = ignoreCache

	CachedAudio.Dump.MetadataField = options.SkipCache and lastCache.MetadataField or metadataTable
	warn(metadataTable, 'from here')
	ZoneObject.EventsPath.UpdateGUI:Fire(metadataTable, options)

	if not options.KeepPosition then
		game.SoundService.Mus.TimePosition = 0
	end
end

-- ========================================================================================================================================================================= --

return ZoneObject