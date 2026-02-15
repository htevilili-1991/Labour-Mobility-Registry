<?php

use App\Models\RegistryBatch;
use App\Models\User;
use App\Notifications\BatchSubmittedForVerification;

test('authenticated user can fetch notifications', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson('/notifications');

    $response->assertOk();
    $response->assertJsonStructure([
        'data',
        'meta' => [
            'unread_count',
            'current_page',
            'last_page',
            'total',
        ],
    ]);
});

test('authenticated user can mark notification as read', function () {
    $user = User::factory()->create();
    $batch = RegistryBatch::factory()->create();
    $user->notify(new BatchSubmittedForVerification($batch));
    $notification = $user->unreadNotifications()->first();

    $response = $this->actingAs($user)->postJson("/notifications/{$notification->id}/read");

    $response->assertOk();
    $response->assertJson(['ok' => true]);
});

test('guest cannot access notifications', function () {
    $response = $this->getJson('/notifications');

    $response->assertRedirect();
});
