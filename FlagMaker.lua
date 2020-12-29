local HttpService = game:GetService("HttpService")
local newFlag = Instance.new("Model")

local FLAG_URL = "http://127.0.0.1:5000/get-flag/5feb3862a5b6df3868bfcbff"
newFlag.Parent = game.Workspace

newFlag.Name = "Flag"

local function getFlagData()
	local response
	local data
	pcall(function ()
		response = HttpService:GetAsync(FLAG_URL)
		data = HttpService:JSONDecode(response)
	end)
	if not data then return {} end
	if data.found then
		return data
	end
	return {}
end

local flagData = getFlagData()
print(flagData)
if flagData then
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
end

local point = CFrame.new(0, 25, 10)
newFlag:SetPrimaryPartCFrame(point)