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
	if not data then return {} end
	if data then
		return data
	end
	return {}
end

local function getFlagData(id)
	local response
	local data
	pcall(function ()
		response = HttpService:GetAsync("http://127.0.0.1:5000/get-flag/" .. id)
		data = HttpService:JSONDecode(response)
	end)
	if not data then return {} end
	if data.found then
		return data
	end
	return {}
end

local function storeFlag(id)
	local success, err = pcall(function()
		flagStore:SetAsync(id, getFlagData(id))
	end) 
	return success
end

local function drawFlag(id, posX, posY)
	local flagData = getFlagData(id)
	if flagData.found then
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
				pixel.Position = Vector3.new(flagData.width-x, flagData.height-y, 1)
				pixel.Size = Vector3.new(1, 1, 1)
				local rIndex = x +(3*(x-1)) + (((y-1)*flagData.width)*4)
				local gIndex = rIndex + 1
				local bIndex = rIndex + 2
				pixel.Color = Color3.new(flagData.png[rIndex]/255, flagData.png[gIndex]/255, flagData.png[bIndex]/255)
				pixel.Parent = newFlag
			end
		end
		local point = CFrame.new(posX, flagData.height, posY)
		newFlag:SetPrimaryPartCFrame(point)
	end
end

local checkForFlags = coroutine.wrap(function()
	while true do
		local newFlags = getUnstoredFlags()
		local toMarkStored = {}
		toMarkStored['flags'] = {}
		if newFlags then
			for i = 1,#newFlags.flags do
				local success, err = pcall(function()
					storeFlag(newFlags[i]['_id'])
					table.insert(toMarkStored['flags'], newFlags[i]['_id'])
				end)
			end
			pcall(function ()
				 HttpService:PostAsync()("http://127.0.0.1:5000/set-flags", toMarkStored)
			end)
		end
	end
end)
