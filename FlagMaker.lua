local HttpService = game:GetService("HttpService")
local DataStoreService = game:GetService("DataStoreService")

local flagStore = DataStoreService:GetDataStore("Flags")

local function getUnstoredFlags()
	local response
	local data
	pcall(function ()
		response = HttpService:GetAsync("http://127.0.0.1:5000/get-flags?approved=1&stored=0")
		data = HttpService:JSONDecode(response)
	end)
	if data then
		return data
	else
		return {count=0}
	end

end

local function getUnstoredPlants()
	local response
	local data
	pcall(function ()
		response = HttpService:GetAsync("http://127.0.0.1:5000/get-plants?stored=0")
		data = HttpService:JSONDecode(response)
	end)
	if data then
		return data
	else
		return {count=0}
	end
end

local function getFlagData(id)
	local response
	local data
	pcall(function ()
		response = HttpService:GetAsync("http://127.0.0.1:5000/get-flag/" .. id)
		data = HttpService:JSONDecode(response)
	end)
	if data.found then
		return data
	end
	return {}
end

local function setFlagsAsStored(ids)
	local response
	local data
	local success, err = pcall(function ()
		response = HttpService:PostAsync("http://127.0.0.1:5000/set-flags", HttpService:JSONEncode(ids),Enum.HttpContentType.ApplicationJson, false)
		data = HttpService:JSONDecode(response)
	end)
	if not success then
		warn(err)
	end
	if data then
		return data
	else
		return {}
	end
end

local function setPlantsAsStored(ids)
	local response
	local data
	local success, err = pcall(function ()
		response = HttpService:PostAsync("http://127.0.0.1:5000/set-plants", HttpService:JSONEncode(ids),Enum.HttpContentType.ApplicationJson, false)
		data = HttpService:JSONDecode(response)
	end)
	if not success then
		warn(err)
	end
	if data then
		return data
	else
		return {}
	end
end

local function storeFlag(id)
	local success, err = pcall(function()
		flagStore:SetAsync(id, getFlagData(id))
	end) 
	if not success then
		warn(err)
	end
	return success
end

local function getStoredFlag(id)
	local flag
	local success, err = pcall(function()
		flag  = flagStore:GetAsync(id)
	end)
	if success then
		return flag
	end
end

local function plantFlag(id, posX, posY)
	local flagData = getStoredFlag(id)
	if flagData ~= nil then
		local newFlag = Instance.new("Model")
		newFlag.Parent = game.Workspace
		newFlag.Name = id
		for y=1, flagData.height do
			for x=1,flagData.width do
				local pixel = Instance.new("Part")
				if y == 1 and x == 1 then
					newFlag.PrimaryPart = pixel
				end
				pixel.Name = "Pixel " .. x .. "-" .. y
				pixel.Anchored = true
				pixel.Position = Vector3.new(1, flagData.height-y, x)
				pixel.Size = Vector3.new(1, 1, 1)
				local rIndex = x +(3*(x-1)) + (((y-1)*flagData.width)*4)
				local gIndex = rIndex + 1
				local bIndex = rIndex + 2
				pixel.Transparency = 1 - (flagData.png[rIndex+3]/255)
				pixel.Color = Color3.new(flagData.png[rIndex]/255, flagData.png[gIndex]/255, flagData.png[bIndex]/255)
				pixel.Parent = newFlag
			end
		end
		local point = CFrame.new(posY, flagData.height, posX)
		newFlag:SetPrimaryPartCFrame(point)
		return true
	else
		return false
	end
end

local function resetStorage()
	local response
	local data
	local success, err = pcall(function ()
		response = HttpService:GetAsync("http://127.0.0.1:5000/reset-storage")
		data = HttpService:JSONDecode(response)
	end)
	if not success then
		warn(err)
	end
	if data then
		return data
	else
		return {}
	end
end

local checkForFlags = coroutine.wrap(function()
	resetStorage()
	while true do
		local newFlags = getUnstoredFlags()
		local toMarkStored = {}
		toMarkStored['stored'] = true
		toMarkStored['flags'] = {}
		if newFlags.count > 0 then
			for i = 1,#newFlags.flags do
				local success, err = pcall(function()
					storeFlag(newFlags.flags[i]['_id'])
					wait(1)
					table.insert(toMarkStored['flags'], newFlags.flags[i]['_id'])
				end)
			end
			if #toMarkStored['flags'] > 0 then
				setFlagsAsStored(toMarkStored)
			end
			toMarkStored = nil
		end
		wait(1)
		local newPlants = getUnstoredPlants()
		local toMarkStored = {}
		toMarkStored['stored'] = true
		toMarkStored['plants'] = {}
		if newPlants.count > 0 then
			for i = 1,#newPlants.plants do
				local plant = plantFlag(newPlants.plants[i].flagId, newPlants.plants[i].x, newPlants.plants[i].z)
				if plant then
					table.insert(toMarkStored['plants'], newPlants.plants[i]['_id'])
				end
			end
			if #toMarkStored['plants'] > 0 then
				setPlantsAsStored(toMarkStored)
			end
			toMarkStored = nil
		end
	end
end)
checkForFlags()