package petadoption.api.events;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import petadoption.api.repository.EventRepository;
import petadoption.api.service.EventService;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

class EventTests {

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private EventService eventService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateEvent() {
        Events event = new Events();
        event.setName("Test Event");

        when(eventRepository.save(event)).thenReturn(event);

        Events createdEvent = eventService.createEvent(event);

        assertNotNull(createdEvent);
        assertEquals("Test Event", createdEvent.getName());
        verify(eventRepository, times(1)).save(event);
    }

    @Test
    void testGetEventById() {
        Events event = new Events();
        event.setId(1L);
        event.setName("Test Event");

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));

        Optional<Events> foundEvent = eventService.getEventById(1L);

        assertTrue(foundEvent.isPresent());
        assertEquals("Test Event", foundEvent.get().getName());
        verify(eventRepository, times(1)).findById(1L);
    }

    @Test
    void testGetAllEvents() {
        Events event1 = new Events();
        event1.setName("Event 1");

        Events event2 = new Events();
        event2.setName("Event 2");

        List<Events> events = Arrays.asList(event1, event2);

        when(eventRepository.findAll()).thenReturn(events);

        List<Events> allEvents = eventService.getAllEvents();

        assertEquals(2, allEvents.size());
        verify(eventRepository, times(1)).findAll();
    }

    @Test
    void testUpdateEvent() {
        Events existingEvent = new Events();
        existingEvent.setId(1L);
        existingEvent.setName("Old Event");

        Events updatedEventDetails = new Events();
        updatedEventDetails.setName("Updated Event");

        when(eventRepository.findById(1L)).thenReturn(Optional.of(existingEvent));
        when(eventRepository.save(existingEvent)).thenReturn(existingEvent);

        Events updatedEvent = eventService.updateEvent(1L, updatedEventDetails);

        assertNotNull(updatedEvent);
        assertEquals("Updated Event", updatedEvent.getName());
        verify(eventRepository, times(1)).findById(1L);
        verify(eventRepository, times(1)).save(existingEvent);
    }

    @Test
    void testDeleteEvent() {
        Events event = new Events();
        event.setId(1L);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        doNothing().when(eventRepository).delete(event);

        eventService.deleteEvent(1L);

        verify(eventRepository, times(1)).findById(1L);
        verify(eventRepository, times(1)).delete(event);
    }
}