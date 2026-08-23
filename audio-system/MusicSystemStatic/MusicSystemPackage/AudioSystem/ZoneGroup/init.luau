--!strict

local ZoneGroup = {}
local ZoneObject = require(script.ZoneObject)
ZoneGroup.__index = ZoneGroup

-- ========================================================================================================================================================================= --

export type ZoneGroupMetatable = {
	ZoneContainer: ZoneGroupInstance,
	Active: boolean
}

export type ZoneGroup = ZoneGroupMetatable & typeof(ZoneGroup)
export type ZoneGroups = {[ZoneGroup]: {ZoneObject.ZoneObject}}
export type ZoneGroupInstance = Folder | Model

local ZONE_GROUP_TAG = 'Audio Zone Group'

-- ========================================================================================================================================================================= --

ZoneGroup.new = function(groupInstance: ZoneGroupInstance): ZoneGroup
	local self = setmetatable({} :: ZoneGroupMetatable, ZoneGroup) :: ZoneGroup
	
	self.ZoneContainer = groupInstance
	self.Active = true
	
	return self
end

ZoneGroup.GetZones = function(self: ZoneGroup, player: Player): {ZoneObject.ZoneObject}
	local zones: {ZoneObject.ZoneObject} = {}
	local zonesChildren = self.ZoneContainer:GetChildren()

	for _, zone: BasePart in zonesChildren do
		if not zone:IsA('BasePart') then
			continue
		end
		
		table.insert(zones, ZoneObject.new(zone, player))
	end

	return zones
end

function ZoneGroup.IsZoneGroup(instance: Instance): boolean
	return instance:IsA("Folder") or instance:IsA("Model")
end

ZoneGroup.SearchForZoneGroups = function(target: ZoneGroupInstance, recursive: boolean): {ZoneGroupInstance}
	local zoneGroups = {}

	for _, zoneGroup: ZoneGroupInstance in target:GetChildren() do
		if not ZoneGroup.IsZoneGroup(zoneGroup) and not zoneGroup:HasTag(ZONE_GROUP_TAG) then
			continue
		end
		
		local subZoneGroups = ZoneGroup.SearchForZoneGroups(zoneGroup, recursive)
		
		table.move(subZoneGroups, 1, #subZoneGroups, #zoneGroups + 1, zoneGroups)
		table.insert(zoneGroups, zoneGroup)
	end

	--# Recursive search appends subgroups within a zone group.

	return zoneGroups
end

ZoneGroup.GetZoneGroups = function(searchLocation: Folder | Model, player: Player): ZoneGroups
	local collectedZoneGroups = {}
	local searchForZoneGroups = ZoneGroup.SearchForZoneGroups(searchLocation, true)

	for _, zoneGroup in searchForZoneGroups do
		local zoneGroupObject = ZoneGroup.new(zoneGroup)
		collectedZoneGroups[zoneGroupObject] = zoneGroupObject:GetZones(player)
	end

	return collectedZoneGroups
end

-- ========================================================================================================================================================================= --

return ZoneGroup