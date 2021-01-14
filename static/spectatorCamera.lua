local TweenService = game:GetService("TweenService")
local player = game.Players.LocalPlayer
local mouse = player:GetMouse()
local camera = workspace.CurrentCamera
local TweenService = game:GetService("TweenService")

function viewPart(model)
	local primaryPart = model.PrimaryPart

	camera.CameraType = Enum.CameraType.Scriptable 


	local baseCFrame = camera.CFrame
	local targetCFrame = primaryPart.CFrame * CFrame.new(-512, 512, 0) * CFrame.Angles(0,math.rad(270),0) * CFrame.Angles(math.rad(315),0, 0)


	local tween = TweenService:Create(
		camera,
		TweenInfo.new(10),
		{CFrame = targetCFrame}
	)

	tween:Play()
	tween.Completed:Wait()
	camera.CFrame = targetCFrame
	camera.CameraType = Enum.CameraType.Custom
	return targetCFrame
end


local spectate = coroutine.wrap(function()
    game.Players.LocalPlayer:ClearCharacterAppearance()
    workspace.meddjr.Head.Transparency = 1
    workspace.meddjr.UpperTorso.Transparency = 1
    workspace.meddjr.LowerTorso.Transparency = 1
    workspace.meddjr.RightHand.Transparency = 1
    workspace.meddjr.RightFoot.Transparency = 1
    workspace.meddjr.RightUpperArm.Transparency = 1
    workspace.meddjr.RightLowerArm.Transparency = 1
    workspace.meddjr.RightUpperLeg.Transparency = 1
    workspace.meddjr.RightLowerLeg.Transparency = 1
    workspace.meddjr.RightUpperTorso.Transparency = 1
    workspace.meddjr.RightLowerTorso.Transparency = 1
    workspace.meddjr.LeftHand.Transparency = 1
    workspace.meddjr.LeftFoot.Transparency = 1
    workspace.meddjr.LeftUpperArm.Transparency = 1
    workspace.meddjr.LeftLowerArm.Transparency = 1
    workspace.meddjr.LeftUpperLeg.Transparency = 1
    workspace.meddjr.LeftLowerLeg.Transparency = 1
	local pos = Vector3.new(0, 50, 0)
	local lookAt = Vector3.new(-2048, 0, 0)
	local cameraCFrame = CFrame.new(pos, lookAt)
	camera.CFrame = cameraCFrame
	while true do
		for i, child in pairs(workspace:GetChildren()) do
			if child:IsA("Model") and child.primaryPart and child.Name ~= "Baseplate" then
				print(child)
				local nextFrame = viewPart(child)
			end
		end
	end
end
)

mouse.KeyDown:connect(function(key)
	if key == "e" then
		print("Pressed e")
		spectate()
	end
end)
